import { UserCreateInputSchema } from '@/prisma/generated/zod';
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
	user: UserCreateInputSchema,
	otp: z.string().optional(),
	inviteToken: z.string().optional()
});

export const registerUserMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof registerUserInputSchema>;
}) => {
	const { otp, inviteToken, user } = input;
	const { xwiki_account, ...newUser } = user;

	const salt = bcrypt.genSaltSync(10);
	const hashedPassword = bcrypt.hashSync(newUser.password, salt);

	newUser.password = hashedPassword;

	if (otp != undefined) {
		const user = await registerUserFromOTP(
			ctx.prisma,
			{
				...newUser,
				email: newUser.email.toLowerCase(),
				active: true,
				xwiki_account: true
			},
			otp as string
		);

		return { data: user };
	} else {
		const userHasConflict = await ctx.prisma.user.findUnique({
			where: {
				email: newUser.email.toLowerCase()
			}
		});

		if (userHasConflict)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'User already exists'
			});

		const isWhiteListed = await checkUserDomain(
			ctx.prisma,
			newUser.email.toLowerCase()
		);

		if (!isWhiteListed)
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'User email domain not whitelisted'
			});

		let createdUser = await ctx.prisma.user.create({
			data: {
				...newUser,
				email: newUser.email.toLowerCase(),
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

		await makeRelationFromUserInvite(ctx.prisma, createdUser);

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
			const userInviteToken = await ctx.prisma.userInviteToken.findUnique({
				where: {
					token: inviteToken as string,
					user_email: createdUser.email.toLowerCase()
				}
			});

			if (!userInviteToken)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invite token not found for this user'
				});

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
