import type { Context } from '@/src/server/trpc';
import { renderRegisterEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateValidationToken } from './utils';

export const resendValidationEmailInputSchema = z.object({
	email: z.string()
});

export const resendValidationEmailMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof resendValidationEmailInputSchema>;
}) => {
	const { email } = input;

	const user = await ctx.prisma.user.findUnique({
		where: { email: email.toLowerCase() }
	});

	if (!user) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'User not found'
		});
	}

	if (user.active) {
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'User is already active'
		});
	}

	const token = await generateValidationToken(ctx.prisma, user.id);

	const emailHtml = await renderRegisterEmail({
		token,
		baseUrl: process.env.NODEMAILER_BASEURL
	});

	await sendMail(
		'Confirmez votre email',
		user.email.toLowerCase(),
		emailHtml,
		`Cliquez sur ce lien pour valider votre compte : ${
			process.env.NODEMAILER_BASEURL
		}/register/validate?${new URLSearchParams({ token })}`
	);

	return { message: 'Validation email resent successfully' };
};
