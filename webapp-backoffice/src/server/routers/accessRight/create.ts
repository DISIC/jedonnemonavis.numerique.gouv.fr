import type { Context } from '@/src/server/trpc';
import { sendMail } from '@/src/utils/mailer';
import { renderInviteEmail, renderUserInviteEmail } from '@/src/utils/emails';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateInviteToken } from '../helpers';

export const createAccessRightInputSchema = z.object({
	user_email: z.string().email(),
	product_id: z.number(),
	role: z.enum(['carrier_user', 'carrier_admin']).optional()
});

export const createAccessRightMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createAccessRightInputSchema>;
}) => {
	const contextUser = ctx.session.user;
	const { user_email, product_id, role } = input;

	const accessRightAlreadyExists = await ctx.prisma.accessRight.findFirst({
		where: {
			OR: [
				{ user_email: user_email.toLowerCase() },
				{ user_email_invite: user_email.toLowerCase() }
			],
			product_id
		}
	});

	const adminEntityRightExists = await ctx.prisma.adminEntityRight.findFirst({
		where: {
			OR: [
				{ user_email: user_email.toLowerCase() },
				{ user_email_invite: user_email.toLowerCase() }
			],
			entity: { products: { some: { id: product_id } } }
		}
	});

	const userIsSuperAdmin = await ctx.prisma.user.findFirst({
		where: { email: user_email, role: { in: ['admin', 'superadmin'] } }
	});

	if (
		(accessRightAlreadyExists !== null &&
			accessRightAlreadyExists.status === 'carrier_user') ||
		adminEntityRightExists ||
		userIsSuperAdmin !== null
	) {
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'Access right already exists'
		});
	}

	const userExists = await ctx.prisma.user.findUnique({
		where: { email: user_email.toLowerCase() }
	});

	const newAccessRight = await ctx.prisma.accessRight.upsert({
		where: { id: accessRightAlreadyExists?.id || -1 },
		update: { status: role },
		create: {
			user_email: userExists ? user_email.toLowerCase() : null,
			user_email_invite: !userExists ? user_email.toLowerCase() : null,
			status: role,
			product_id
		},
		include: { user: true, product: true }
	});

	if (newAccessRight.user === null) {
		const token = await generateInviteToken(ctx.prisma, user_email);

		const emailHtml = await renderUserInviteEmail({
			inviterName: contextUser.name || "Quelqu'un",
			recipientEmail: user_email.toLowerCase(),
			inviteToken: token,
			productTitle: newAccessRight.product.title,
			baseUrl: process.env.NODEMAILER_BASEURL
		});

		await sendMail(
			'Invitation à rejoindre « Je donne mon avis »',
			user_email.toLowerCase(),
			emailHtml,
			`Cliquez sur ce lien pour créer votre compte : ${
				process.env.NODEMAILER_BASEURL
			}/register?${new URLSearchParams({
				email: user_email.toLowerCase(),
				inviteToken: token
			})}`
		);
	} else {
		const emailHtml = await renderInviteEmail({
			inviterName: contextUser.name || "Quelqu'un",
			productTitle: newAccessRight.product.title,
			baseUrl: process.env.NODEMAILER_BASEURL
		});

		await sendMail(
			`Accès à la démarche « ${newAccessRight.product.title} » sur la plateforme « Je donne mon avis »`,
			user_email.toLowerCase(),
			emailHtml,
			`Cliquez sur ce lien pour rejoindre le produit numérique "${newAccessRight.product.title}" : ${process.env.NODEMAILER_BASEURL}`
		);
	}

	return { data: newAccessRight };
};
