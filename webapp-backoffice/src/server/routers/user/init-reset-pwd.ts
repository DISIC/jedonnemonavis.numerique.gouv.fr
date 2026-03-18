import type { Context } from '@/src/server/trpc';
import { renderResetPasswordEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { generateRandomString } from '@/src/utils/tools';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const initResetPwdInputSchema = z.object({
	email: z.string(),
	forgot: z.boolean().optional()
});

export const initResetPwdMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof initResetPwdInputSchema>;
}) => {
	const { email, forgot } = input;

	const user = await ctx.prisma.user.findUnique({
		where: {
			email: email.toLowerCase()
		}
	});

	if (!user) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'User not found'
		});
	}

	const token = generateRandomString(32);

	//delete old token if exists
	await ctx.prisma.userResetToken.deleteMany({
		where: {
			user_id: user.id
		}
	});

	await ctx.prisma.userResetToken.create({
		data: {
			user_id: user.id,
			token: token,
			user_email: user.email.toLowerCase(),
			expiration_date: new Date(new Date().getTime() + 15 * 60 * 1000)
		}
	});

	const emailHtml = await renderResetPasswordEmail({
		token,
		baseUrl: process.env.NODEMAILER_BASEURL
	});

	await sendMail(
		forgot ? 'Mot de passe oublié' : 'Réinitialisation du mot de passe',
		email.toLowerCase(),
		emailHtml,
		`Cliquez sur ce lien pour réinitialiser votre mot de passe : ${
			process.env.NODEMAILER_BASEURL
		}/reset-password?${new URLSearchParams({ token })}`
	);

	return { data: token };
};
