import type { Context } from '@/src/server/trpc';
import { renderRegisterEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import {
	checkUserDomain,
	generateValidationToken,
	makeRelationFromUserInvite,
	registerUserFromOTP,
	updateUser
} from './utils';

export const registerUserInputSchema = z.object({
	user: z.object({
		firstName: z.string().trim().max(255).optional(),
		lastName: z.string().trim().max(255).optional(),
		email: z.string().trim().toLowerCase().email().max(254),
		password: z
			.string()
			.min(12, 'Password must be at least 12 characters')
			.max(256)
	}),
	otp: z.string().max(255).optional(),
	inviteToken: z.string().max(255).optional()
});

export const registerUserMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof registerUserInputSchema>;
}) => {
	const { otp, inviteToken, user } = input;

	const email = user.email.toLowerCase();

	const salt = bcrypt.genSaltSync(10);
	const hashedPassword = bcrypt.hashSync(user.password, salt);

	if (otp != undefined) {
		const updatedUser = await registerUserFromOTP(
			ctx.prisma,
			{
				firstName: user.firstName,
				lastName: user.lastName,
				email,
				password: hashedPassword
			},
			otp as string
		);

		return { data: updatedUser };
	} else {
		const userHasConflict = await ctx.prisma.user.findUnique({
			where: {
				email
			}
		});

		if (userHasConflict)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'User already exists'
			});

		const isWhiteListed = await checkUserDomain(ctx.prisma, email);

		if (!isWhiteListed)
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'User email domain not whitelisted'
			});

		if (inviteToken) {
			const userInviteToken = await ctx.prisma.userInviteToken.findUnique({
				where: {
					token: inviteToken,
					user_email: email
				}
			});

			if (!userInviteToken)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invite token not found for this user'
				});
		}

		let createdUser = await ctx.prisma.user.create({
			data: {
				email,
				firstName: user.firstName,
				lastName: user.lastName,
				password: hashedPassword,
				role: 'user',
				active: false,
				xwiki_account: false,
				notifications: true,
				notifications_frequency: 'weekly'
			}
		});

		createdUser = { ...createdUser, password: 'Nice try!' };

		if (!createdUser)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Internal server error while creating user'
			});

		await makeRelationFromUserInvite(ctx.prisma, createdUser.email);

		if (!inviteToken) {
			const token = await generateValidationToken(ctx.prisma, createdUser.id);

			const emailHtml = await renderRegisterEmail({
				token,
				baseUrl: process.env.NODEMAILER_BASEURL
			});

			await sendMail(
				'Confirmez votre email',
				createdUser.email.toLowerCase(),
				emailHtml,
				`Cliquez sur ce lien pour valider votre compte : ${
					process.env.NODEMAILER_BASEURL
				}/register/validate?${new URLSearchParams({ token })}`
			);
		} else {
			await ctx.prisma.userInviteToken.deleteMany({
				where: {
					user_email: createdUser.email.toLowerCase()
				}
			});

			await updateUser(ctx.prisma, createdUser.id, { active: true });
		}

		return { data: createdUser };
	}
};
