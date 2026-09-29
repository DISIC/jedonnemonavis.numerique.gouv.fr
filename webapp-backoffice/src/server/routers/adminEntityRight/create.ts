import type { Context } from '@/src/server/trpc';
import { sendMail } from '@/src/utils/mailer';
import { renderInviteEmail, renderUserInviteEmail } from '@/src/utils/emails';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const createAdminEntityRightInputSchema = z.object({
	user_email: z.string().email(),
	entity_id: z.number(),
	entity_name: z.string().optional()
});

export const createAdminEntityRightMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createAdminEntityRightInputSchema>;
}) => {
	const contextUser = ctx.session!.user;
	const { user_email, entity_id } = input;

	const adminEntityRightAlreadyExists =
		await ctx.prisma.adminEntityRight.findFirst({
			where: {
				OR: [
					{ user_email: user_email.toLowerCase() },
					{ user_email_invite: user_email.toLowerCase() }
				],
				entity_id
			}
		});

	if (adminEntityRightAlreadyExists !== null) {
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'Access right already exists'
		});
	}

	const userExists = await ctx.prisma.user.findUnique({
		where: { email: user_email.toLowerCase() }
	});

	const newAdminEntityRight = await ctx.prisma.adminEntityRight.create({
		data: {
			user_email: userExists ? user_email.toLowerCase() : null,
			user_email_invite: !userExists ? user_email.toLowerCase() : null,
			entity_id
		},
		include: { user: true, entity: true }
	});

	if (newAdminEntityRight.user === null) {
		const emailHtml = await renderUserInviteEmail({
			inviterName: contextUser.name || "Quelqu'un",
			entityName: newAdminEntityRight.entity.name,
			baseUrl: process.env.NODEMAILER_BASEURL
		});

		await sendMail(
			'Invitation à rejoindre « Je donne mon avis »',
			user_email.toLowerCase(),
			emailHtml,
			`Connectez-vous avec ProConnect pour y accéder : ${process.env.NODEMAILER_BASEURL}/login`
		);
	} else {
		const emailHtml = await renderInviteEmail({
			inviterName: contextUser.name || "Quelqu'un",
			entityName: newAdminEntityRight.entity.name,
			baseUrl: process.env.NODEMAILER_BASEURL
		});
		await sendMail(
			`Accès à l'organisation « ${newAdminEntityRight.entity.name} » sur la plateforme « Je donne mon avis »`,
			user_email.toLowerCase(),
			emailHtml,
			`Cliquez sur ce lien pour rejoindre l'organisation "${newAdminEntityRight.entity.name}" : ${process.env.NODEMAILER_BASEURL}`
		);
	}

	await ctx.prisma.accessRight.deleteMany({
		where: {
			OR: [
				{ user_email: user_email.toLowerCase() },
				{ user_email_invite: user_email.toLowerCase() }
			],
			product: { entity_id }
		}
	});

	return { data: newAdminEntityRight };
};
