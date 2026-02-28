import type { Context } from '@/src/server/trpc';
import { sendMail } from '@/src/utils/mailer';
import { renderUserInviteEmail } from '@/src/utils/emails';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateInviteToken } from '../helpers';

export const resendAdminEntityRightEmailInputSchema = z.object({
	entity_id: z.number(),
	user_email: z.string().email()
});

export const resendAdminEntityRightEmailMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof resendAdminEntityRightEmailInputSchema>;
}) => {
	const { user_email, entity_id } = input;
	const contextUser = ctx.session.user;

	const entity = await ctx.prisma.entity.findUnique({
		where: { id: entity_id }
	});

	if (!entity)
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Entity not found' });

	const token = await generateInviteToken(ctx.prisma, user_email);

	const emailHtml = await renderUserInviteEmail({
		inviterName: contextUser.name || "Quelqu'un",
		recipientEmail: user_email.toLowerCase(),
		inviteToken: token,
		entityName: entity.name,
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
};
