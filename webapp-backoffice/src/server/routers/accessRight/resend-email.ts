import type { Context } from '@/src/server/trpc';
import { sendMail } from '@/src/utils/mailer';
import { renderUserInviteEmail } from '@/src/utils/emails';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateInviteToken } from '../helpers';

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

	const product = await ctx.prisma.product.findUnique({
		where: { id: product_id }
	});

	if (!product)
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });

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
