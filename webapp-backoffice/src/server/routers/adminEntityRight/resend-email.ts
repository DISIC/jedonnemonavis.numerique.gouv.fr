import type { Context } from '@/src/server/trpc';
import { sendMail } from '@/src/utils/mailer';
import { renderUserInviteEmail } from '@/src/utils/emails';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateInviteToken } from '../helpers';
import { checkEntityRight } from '../entity/utils';

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
	const contextUser = ctx.session!.user;

	const pendingInvite = await ctx.prisma.adminEntityRight.findFirst({
		where: { entity_id, user_email_invite: user_email.toLowerCase() }
	});

	if (!pendingInvite)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Pending invite not found'
		});

	const { entity } = await checkEntityRight({
		prisma: ctx.prisma,
		session: ctx.session!,
		entity_id: pendingInvite.entity_id
	});

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
