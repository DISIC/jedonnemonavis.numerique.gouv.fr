import type { Context } from '@/src/server/trpc';
import { renderResetPasswordEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { generateRandomString } from '@/src/utils/tools';
import { z } from 'zod';

export const initResetPwdInputSchema = z.object({
	email: z.string().trim().toLowerCase().email().max(254),
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
	const normalizedEmail = email.toLowerCase();

	const silentSuccess = { data: { success: true } };

	const user = await ctx.prisma.user.findUnique({
		where: { email: normalizedEmail }
	});

	if (!user) return silentSuccess;

	const token = generateRandomString(32);

	await ctx.prisma.userResetToken.deleteMany({
		where: { user_id: user.id }
	});

	await ctx.prisma.userResetToken.create({
		data: {
			user_id: user.id,
			token,
			user_email: normalizedEmail,
			expiration_date: new Date(Date.now() + 15 * 60 * 1000)
		}
	});

	const emailHtml = await renderResetPasswordEmail({
		token,
		baseUrl: process.env.NODEMAILER_BASEURL
	});

	await sendMail(
		forgot ? 'Mot de passe oublié' : 'Réinitialisation du mot de passe',
		normalizedEmail,
		emailHtml,
		`Cliquez sur ce lien pour réinitialiser votre mot de passe : ${
			process.env.NODEMAILER_BASEURL
		}/reset-password?${new URLSearchParams({ token })}`
	);

	return silentSuccess;
};
