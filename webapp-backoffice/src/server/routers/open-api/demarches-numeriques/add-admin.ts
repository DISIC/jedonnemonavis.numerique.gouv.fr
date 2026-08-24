import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '@/src/server/trpc';
import { generateRandomString } from '@/src/utils/tools';
import { renderInviteEmail, renderUserInviteEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { DN_SOURCE } from '@/src/utils/demarches-numeriques';
import { assertPartnerKey } from '../helpers';

/**
 * Ajoute des admins (carrier_admin) à un service DN existant, identifié par son
 * external_id. Chaque email est traité indépendamment ; le résultat détaille le statut par
 * email. Voir docs/demarches-numeriques-provisioning.md.
 */

const DN_INVITER_NAME = 'Démarches Numériques';

function buildRegisterUrl(email: string, token: string): string {
	return `${process.env.NODEMAILER_BASEURL}/register?${new URLSearchParams({
		email,
		inviteToken: token
	})}`;
}

export const addAdminInputSchema = z.object({
	external_id: z.string().min(1),
	admin_emails: z.array(z.string().email()).min(1)
});

export const addAdminOutputSchema = z.object({
	results: z.array(
		z.object({
			email: z.string(),
			status: z.enum(['invited', 'already_admin', 'error'])
		})
	)
});

export const addAdminMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof addAdminInputSchema>;
}) => {
	assertPartnerKey(ctx, DN_SOURCE);

	const external_id = input.external_id.trim();

	const product = await ctx.prisma.product.findUnique({
		where: { source_external_id: { source: DN_SOURCE, external_id } }
	});
	if (!product) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: `Aucun service DN pour external_id "${external_id}".`
		});
	}

	await ctx.prisma.apiKeyLog.create({
		data: { apikey_id: ctx.api_key?.id || 0, url: ctx.req.url || '' }
	});

	const emails = Array.from(
		new Set(input.admin_emails.map(e => e.toLowerCase()))
	);

	const results: {
		email: string;
		status: 'invited' | 'already_admin' | 'error';
	}[] = [];

	for (const email of emails) {
		try {
			const alreadyHasAccess =
				(await ctx.prisma.accessRight.findFirst({
					where: {
						product_id: product.id,
						OR: [{ user_email: email }, { user_email_invite: email }]
					}
				})) !== null;

			const isSuperAdmin =
				(await ctx.prisma.user.findFirst({
					where: { email, role: { in: ['admin', 'superadmin'] } }
				})) !== null;

			if (alreadyHasAccess || isSuperAdmin) {
				results.push({ email, status: 'already_admin' });
				continue;
			}

			const user = await ctx.prisma.user.findUnique({ where: { email } });

			// Octroi du droit (partie essentielle : détermine le statut renvoyé).
			await ctx.prisma.accessRight.create({
				data: {
					product_id: product.id,
					status: 'carrier_admin',
					user_email: user ? email : null,
					user_email_invite: user ? null : email
				}
			});

			let token: string | null = null;
			if (!user) {
				token = generateRandomString(32);
				await ctx.prisma.userInviteToken.create({
					data: { user_email: email, token }
				});
			}

			await ctx.prisma.userEvent.create({
				data: {
					user_id: ctx.user_api?.id,
					action: 'service_invite',
					product_id: product.id,
					metadata: { source: DN_SOURCE, external_id, invited_email: email }
				}
			});

			results.push({ email, status: 'invited' });

			// Envoi du mail : non bloquant, n'affecte pas le statut « invited ».
			try {
				if (user) {
					const html = await renderInviteEmail({
						inviterName: DN_INVITER_NAME,
						productTitle: product.title,
						baseUrl: process.env.NODEMAILER_BASEURL
					});
					await sendMail(
						`Accès à la démarche « ${product.title} » sur la plateforme « Je donne mon avis »`,
						email,
						html,
						`Vous avez reçu un accès à la démarche « ${product.title} » : ${process.env.NODEMAILER_BASEURL}`
					);
				} else {
					const html = await renderUserInviteEmail({
						inviterName: DN_INVITER_NAME,
						recipientEmail: email,
						inviteToken: token as string,
						productTitle: product.title,
						baseUrl: process.env.NODEMAILER_BASEURL
					});
					await sendMail(
						'Invitation à rejoindre « Je donne mon avis »',
						email,
						html,
						`Créez votre compte : ${buildRegisterUrl(email, token as string)}`
					);
				}
			} catch (mailErr) {
				console.error(
					`[DN add-admin] droit créé mais échec d'envoi du mail à ${email} (service ${product.id}) :`,
					mailErr
				);
			}
		} catch (err) {
			console.error(
				`[DN add-admin] échec pour ${email} (service ${product.id}) :`,
				err
			);
			results.push({ email, status: 'error' });
		}
	}

	return { results };
};
