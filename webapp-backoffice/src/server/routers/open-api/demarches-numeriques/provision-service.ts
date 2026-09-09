import { TRPCError } from '@trpc/server';
import {
	ButtonIntegrationTypes,
	FormTemplateButtonStyle,
	Prisma
} from '@prisma/client';
import { z } from 'zod';
import type { Context } from '@/src/server/trpc';
import { ButtonWithElements } from '@/src/types/prismaTypesExtended';
import {
	generateRandomString,
	getButtonCode,
	getButtonUrl,
	normalizeString
} from '@/src/utils/tools';
import {
	DN_SOURCE,
	DN_TAMPON_ENTITY_NAME
} from '@/src/utils/demarches-numeriques';
import { sendMail } from '@/src/utils/mailer';
import {
	renderDnCreatorInviteEmail,
	renderInviteEmail,
	renderUserInviteEmail
} from '@/src/utils/emails';
import { assertPartnerKey } from '../helpers';

/** Nom d'expéditeur logique pour les mails d'invitation classiques de ce parcours. */
const DN_INVITER_NAME = 'Démarches Numériques';

/**
 * Endpoint composite de provisioning d'un service JDMA depuis Démarches Numériques.
 * Voir docs/demarches-numeriques-provisioning.md.
 *
 * NB : l'envoi des mails d'invitation (mail spécifique créateur + mail classique pour les
 * autres admins) est ajouté au lot L2. Ici on crée les droits + les jetons d'invitation et
 * on renvoie les liens d'inscription ; aucun mail n'est encore envoyé.
 */

const BUTTON_INCLUDE = {
	form: { include: { form_template: true } },
	form_template_button: { include: { variants: true } }
} satisfies Prisma.ButtonInclude;

const DEFAULT_BUTTON_STYLE: FormTemplateButtonStyle = 'solid';

function buildIntegration(
	button: ButtonWithElements,
	integrationType: 'button' | 'link'
) {
	const integration_url = getButtonUrl(button);

	if (integrationType === 'link') {
		return { integration_url, integration_code: integration_url };
	}

	const integration_code = getButtonCode({
		buttonStyle: button.button_style ?? DEFAULT_BUTTON_STYLE,
		button,
		formTemplateButton: button.form_template_button,
		theme: 'clair'
	});

	return { integration_url, integration_code };
}

function buildRegisterUrl(email: string, token: string): string {
	return `${process.env.NODEMAILER_BASEURL}/register?${new URLSearchParams({
		email,
		inviteToken: token
	})}`;
}

export const provisionServiceInputSchema = z.object({
	external_id: z.string().min(1),
	demarche_name: z.string().min(1),
	organisation_name: z.string().min(1),
	creator_email: z.string().email(),
	admin_emails: z.array(z.string().email()).optional().default([]),
	integration_type: z.enum(['button', 'link']).optional().default('button')
});

export const provisionServiceOutputSchema = z.object({
	product_id: z.number(),
	form_id: z.number(),
	button_id: z.number(),
	integration_type: z.enum(['button', 'link']),
	integration_url: z.string(),
	integration_code: z.string(),
	invitations: z.array(
		z.object({
			email: z.string(),
			role: z.string(),
			account_existed: z.boolean(),
			register_url: z.string().nullable()
		})
	),
	already_existed: z.boolean()
});

export const provisionServiceMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof provisionServiceInputSchema>;
}) => {
	assertPartnerKey(ctx, DN_SOURCE);

	const external_id = input.external_id.trim();
	const integration_type = input.integration_type;

	// Créateur en premier, puis les autres admins, dédupliqués et en minuscules.
	const emails = Array.from(
		new Set(
			[input.creator_email, ...input.admin_emails].map(e => e.toLowerCase())
		)
	);

	// --- Idempotence : un service déjà provisionné pour cet external_id est renvoyé tel quel.
	const existingProduct = await ctx.prisma.product.findUnique({
		where: { source_external_id: { source: DN_SOURCE, external_id } }
	});

	if (existingProduct) {
		const existingForm = await ctx.prisma.form.findFirst({
			where: { product_id: existingProduct.id, isDeleted: { not: true } },
			orderBy: { id: 'asc' }
		});
		const existingButton = existingForm
			? await ctx.prisma.button.findFirst({
					where: { form_id: existingForm.id, isDeleted: { not: true } },
					orderBy: { id: 'asc' },
					include: BUTTON_INCLUDE
			  })
			: null;

		if (!existingForm || !existingButton) {
			throw new TRPCError({
				code: 'CONFLICT',
				message: `Le service DN "${external_id}" existe déjà mais est incomplet (formulaire ou bouton manquant). Intervention manuelle requise.`
			});
		}

		const integration = buildIntegration(existingButton, integration_type);

		return {
			product_id: existingProduct.id,
			form_id: existingForm.id,
			button_id: existingButton.id,
			integration_type,
			...integration,
			invitations: [],
			already_existed: true
		};
	}

	// --- Organisation tampon (partagée par tous les services DN).
	const tampon = await ctx.prisma.entity.findUnique({
		where: { name: DN_TAMPON_ENTITY_NAME }
	});
	if (!tampon) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: `Organisation tampon "${DN_TAMPON_ENTITY_NAME}" introuvable (seed manquant).`
		});
	}

	// --- Template observatoire + son bouton par défaut.
	const rootTemplate = await ctx.prisma.formTemplate.findUnique({
		where: { slug: 'root' },
		include: {
			form_template_buttons: {
				where: { isDefault: true },
				include: { variants: true },
				take: 1
			}
		}
	});
	if (!rootTemplate) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Template de formulaire observatoire (root) introuvable.'
		});
	}
	const defaultTemplateButton = rootTemplate.form_template_buttons[0] ?? null;
	if (integration_type === 'button' && !defaultTemplateButton) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Aucun bouton par défaut sur le template observatoire.'
		});
	}

	const creatorEmail = input.creator_email.toLowerCase();

	const recipients: {
		email: string;
		isCreator: boolean;
		account_existed: boolean;
		token: string | null;
		register_url: string | null;
	}[] = [];

	const result = await ctx.prisma.$transaction(async tx => {
		const product = await tx.product.create({
			data: {
				title: input.demarche_name,
				title_formatted: normalizeString(input.demarche_name),
				entity_id: tampon.id,
				source: DN_SOURCE,
				external_id,
				external_organisation_name: input.organisation_name
			}
		});

		const form = await tx.form.create({
			data: {
				title: rootTemplate.title,
				product_id: product.id,
				form_template_id: rootTemplate.id
			}
		});

		// Publication : un FormConfig publié rend le formulaire exploitable (comme l'UI).
		await tx.formConfig.create({
			data: { form_id: form.id, status: 'published', version: 0 }
		});

		const button = await tx.button.create({
			data: {
				title: input.demarche_name,
				form_id: form.id,
				integration_type: integration_type as ButtonIntegrationTypes,
				...(integration_type === 'button' && defaultTemplateButton
					? {
							form_template_button_id: defaultTemplateButton.id,
							button_style: DEFAULT_BUTTON_STYLE
					  }
					: {})
			},
			include: BUTTON_INCLUDE
		});

		// Droits admin (créateur + autres) + jetons d'invitation pour les comptes absents.
		for (const email of emails) {
			const user = await tx.user.findUnique({ where: { email } });

			await tx.accessRight.create({
				data: {
					product_id: product.id,
					status: 'carrier_admin',
					user_email: user ? email : null,
					user_email_invite: user ? null : email
				}
			});

			let token: string | null = null;
			let register_url: string | null = null;
			if (!user) {
				token = generateRandomString(32);
				await tx.userInviteToken.create({ data: { user_email: email, token } });
				register_url = buildRegisterUrl(email, token);
			}

			recipients.push({
				email,
				isCreator: email === creatorEmail,
				account_existed: !!user,
				token,
				register_url
			});
		}

		return { product, form, button };
	});

	// Audit + journal d'appel (hors transaction).
	await ctx.prisma.userEvent.create({
		data: {
			user_id: ctx.user_api?.id,
			action: 'service_create',
			product_id: result.product.id,
			form_id: result.form.id,
			metadata: {
				source: DN_SOURCE,
				external_id,
				organisation_name: input.organisation_name
			}
		}
	});
	await ctx.prisma.apiKeyLog.create({
		data: { apikey_id: ctx.api_key?.id || 0, url: ctx.req.url || '' }
	});

	// Envoi des mails (hors transaction). Créateur = mail spécifique DN×JDMA ; autres
	// invités = mail classique. Non bloquant : un échec d'envoi ne remet pas en cause le
	// service déjà créé (DN peut relancer, les jetons restent valides).
	const baseUrl = process.env.NODEMAILER_BASEURL;
	for (const r of recipients) {
		try {
			if (r.account_existed) {
				const html = await renderInviteEmail({
					inviterName: DN_INVITER_NAME,
					productTitle: input.demarche_name,
					baseUrl
				});
				await sendMail(
					`Accès à la démarche « ${input.demarche_name} » sur la plateforme « Je donne mon avis »`,
					r.email,
					html,
					`Vous avez reçu un accès à la démarche « ${input.demarche_name} » : ${baseUrl}`
				);
			} else if (r.isCreator) {
				const html = await renderDnCreatorInviteEmail({
					recipientEmail: r.email,
					inviteToken: r.token as string,
					demarcheName: input.demarche_name,
					baseUrl
				});
				await sendMail(
					'Votre formulaire « Je donne mon avis » est prêt',
					r.email,
					html,
					`Créez votre compte pour suivre les résultats : ${r.register_url}`
				);
			} else {
				const html = await renderUserInviteEmail({
					inviterName: DN_INVITER_NAME,
					recipientEmail: r.email,
					inviteToken: r.token as string,
					productTitle: input.demarche_name,
					baseUrl
				});
				await sendMail(
					'Invitation à rejoindre « Je donne mon avis »',
					r.email,
					html,
					`Créez votre compte : ${r.register_url}`
				);
			}
		} catch (err) {
			console.error(
				`[DN provisioning] échec d'envoi du mail à ${r.email} (service ${result.product.id}) :`,
				err
			);
		}
	}

	const integration = buildIntegration(result.button, integration_type);

	return {
		product_id: result.product.id,
		form_id: result.form.id,
		button_id: result.button.id,
		integration_type,
		...integration,
		invitations: recipients.map(r => ({
			email: r.email,
			role: 'carrier_admin',
			account_existed: r.account_existed,
			register_url: r.register_url
		})),
		already_existed: false
	};
};
