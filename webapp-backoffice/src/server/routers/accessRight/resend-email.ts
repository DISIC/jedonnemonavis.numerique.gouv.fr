import type { Context } from '@/src/server/trpc';
import { sendMail } from '@/src/utils/mailer';
import { renderUserInviteEmail } from '@/src/utils/emails';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateInviteToken } from '../helpers';
import { checkRightToProceed } from '../product/utils';

export const resendAccessRightEmailInputSchema = z.object({
	product_id: z.number(),
	user_email: z.string().email()
});

export const resendAccessRightEmailMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof resendAccessRightEmailInputSchema>;
}) => {
	const { user_email, product_id } = input;
	const contextUser = ctx.session!.user;

	const pendingInvite = await ctx.prisma.accessRight.findFirst({
		where: {
			product_id,
			user_email_invite: user_email.toLowerCase(),
			status: { not: 'removed' }
		}
	});

	if (!pendingInvite)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Pending invite not found'
		});

	const { product } = await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id: pendingInvite.product_id
	});

	const token = await generateInviteToken(ctx.prisma, user_email);

	const emailHtml = await renderUserInviteEmail({
		inviterName: contextUser.name || "Quelqu'un",
		recipientEmail: user_email.toLowerCase(),
		inviteToken: token,
		productTitle: product.title,
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
