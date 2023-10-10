import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { UserCreateInputSchema } from '@/prisma/generated/zod';
import crypto from 'crypto';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
	extractDomainFromEmail,
	generateRandomString,
	getRegisterEmailHtml
} from '@/src/utils/tools';
import { sendMail } from '@/src/utils/mailer';

export async function registerUserFromOTP(
	prisma: PrismaClient,
	user: Prisma.UserCreateInput,
	otp: string
) {
	const userOTP = await prisma.userOTP.findUnique({
		where: {
			code: otp
		},
		include: {
			user: true
		}
	});

	if (!userOTP || !userOTP.user) return;

	await prisma.user.update({
		where: {
			id: userOTP.user.id
		},
		data: {
			...user
		}
	});

	await prisma.userOTP.delete({
		where: {
			code: otp
		}
	});

	return { ...user, password: 'Nice try!' };
}

export async function updateUser(
	prisma: PrismaClient,
	userId: number,
	user: Prisma.UserUpdateInput
) {
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: { ...user }
	});
	return { ...updatedUser, password: 'Nice try!' };
}

export async function generateValidationToken(
	prisma: PrismaClient,
	userId: number
) {
	const token = generateRandomString(32);
	await prisma.userValidationToken.create({
		data: {
			user_id: userId,
			token
		}
	});

	return token;
}

export async function makeRelationFromUserInvite(
	prisma: PrismaClient,
	user: User
) {
	const userInvites = await prisma.accessRight.findMany({
		where: {
			user_email_invite: user.email
		}
	});

	if (userInvites.length > 0) {
		await prisma.accessRight.updateMany({
			where: {
				id: {
					in: userInvites.map(invite => invite.id)
				}
			},
			data: {
				user_email: user.email
			}
		});
	}
}

export async function checkUserDomain(prisma: PrismaClient, email: string) {
	const domain = extractDomainFromEmail(email);
	if (!domain) return false;

	const domainWhiteListed = await prisma.whiteListedDomain.findFirst({
		where: { domain }
	});
	return !!domainWhiteListed;
}

export const userRouter = router({
	register: publicProcedure
		.input(
			z.object({
				user: UserCreateInputSchema,
				otp: z.string().optional(),
				inviteToken: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { otp, inviteToken, user } = input;
			const { observatoire_account, ...newUser } = user;

			const hashedPassword = crypto
				.createHash('sha256')
				.update(newUser.password)
				.digest('hex');

			newUser.password = hashedPassword;

			if (!!otp) {
				const user = await registerUserFromOTP(
					ctx.prisma,
					{ ...newUser, observatoire_account: true },
					otp as string
				);

				return { data: user };
			} else {
				const userHasConflict = await ctx.prisma.user.findUnique({
					where: {
						email: newUser.email
					}
				});

				if (userHasConflict)
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'User already exists'
					});

				const isWhiteListed = await checkUserDomain(ctx.prisma, newUser.email);

				if (!isWhiteListed)
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'User email domain not whitelisted'
					});

				let createdUser = await ctx.prisma.user.create({
					data: {
						...newUser
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
					const token = await generateValidationToken(
						ctx.prisma,
						createdUser.id
					);

					await sendMail(
						'Confirmez votre email',
						createdUser.email,
						getRegisterEmailHtml(token),
						`Cliquez sur ce lien pour valider votre compte : ${
							process.env.NODEMAILER_BASEURL
						}/register/validate?${new URLSearchParams({ token })}`
					);
				} else {
					const userInviteToken = await ctx.prisma.userInviteToken.findUnique({
						where: {
							token: inviteToken as string,
							user_email: createdUser.email
						}
					});

					if (!userInviteToken)
						throw new TRPCError({
							code: 'NOT_FOUND',
							message: 'Invite token not found for this user'
						});

					await ctx.prisma.userInviteToken.deleteMany({
						where: {
							user_email: createdUser.email
						}
					});

					await updateUser(ctx.prisma, createdUser.id, { active: true });
				}

				return { data: createdUser };
			}
		})
});
