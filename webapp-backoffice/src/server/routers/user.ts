import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { UserCreateInputSchema } from '@/prisma/generated/zod';
import crypto from 'crypto';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
	extractDomainFromEmail,
	generateRandomString,
	getOTPEmailHtml,
	getRegisterEmailHtml
} from '@/src/utils/tools';
import { sendMail } from '@/src/utils/mailer';

export async function createOTP(prisma: PrismaClient, user: User) {
	const now = new Date();
	await prisma.userOTP.deleteMany({
		where: {
			user_id: user.id
		}
	});

	const code = generateRandomString();
	await prisma.userOTP.create({
		data: {
			user_id: user.id,
			code,
			//15mn validity
			expiration_date: new Date(now.getTime() + 15 * 60 * 1000)
		}
	});

	await sendMail(
		'Votre mot de passe temporaire',
		user.email,
		getOTPEmailHtml(code),
		`Votre mot de passe temporaire valable 15 minutes : ${code}`
	);
}

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
	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				sort: z.string().optional(),
				search: z.string().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, sort, search } = input;

			let orderBy: any = [
				{
					email: 'asc'
				}
			];

			let where: any = {
				email: {
					contains: ''
				}
			};

			if (search) {
				const searchQuery = search.split(' ').join(' | ');
				where.email = {
					contains: searchQuery
				};
			}

			if (sort) {
				const values = sort.split(':');
				if (values.length === 2) {
					if (values[0].includes('.')) {
						const subValues = values[0].split('.');
						if (subValues.length === 2) {
							orderBy = [
								{
									[subValues[0]]: {
										[subValues[1]]: values[1]
									}
								}
							];
						}
					} else {
						orderBy = [
							{
								[values[0]]: values[1]
							}
						];
					}
				}
			}

			const users = await ctx.prisma.user.findMany({
				orderBy,
				where,
				take: numberPerPage,
				skip: numberPerPage * (page - 1)
			});

			const count = await ctx.prisma.user.count({ where });

			return { data: users, metadata: { count } };
		}),

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

			if (otp != undefined) {
				const user = await registerUserFromOTP(
					ctx.prisma,
					{ ...newUser, active: true, observatoire_account: true },
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
		}),

	validate: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ ctx, input }) => {
			const { token } = input;

			const userValidationToken =
				await ctx.prisma.userValidationToken.findUnique({
					where: { token },
					include: { user: true }
				});

			if (!userValidationToken) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invalid token'
				});
			} else {
				const updatedUser = await updateUser(
					ctx.prisma,
					userValidationToken.user.id,
					{ ...userValidationToken.user, active: true }
				);

				await ctx.prisma.userValidationToken.delete({
					where: {
						id: userValidationToken.id
					}
				});

				return { data: updatedUser };
			}
		}),

	checkEmail: publicProcedure
		.input(z.object({ email: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { email } = input;

			const user = await ctx.prisma.user.findUnique({
				where: {
					email
				}
			});

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found'
				});
			} else if (user.observatoire_account && !user.active) {
				createOTP(ctx.prisma, user);

				return { data: undefined, metadata: { statusCode: 206 } };
			} else if (!user.active) {
				// Code: 423
				throw new TRPCError({
					code: 'CONFLICT',
					message: "User isn't active"
				});
			} else {
				return { data: user, metadata: { statusCode: 200 } };
			}
		}),

	me: publicProcedure
		.input(z.object({ otp: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			const { otp } = input;

			if (otp) {
				const userOTP = await ctx.prisma.userOTP.findUnique({
					where: {
						code: otp
					},
					include: {
						user: {
							select: {
								firstName: true,
								lastName: true,
								email: true
							}
						}
					}
				});

				if (!userOTP?.user)
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'User not found from OTP'
					});

				return { data: userOTP.user };
			} else {
				const session = ctx.session;

				if (!session) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'Unauthorized'
					});
				}

				if (!session.user) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'User not found from session'
					});
				}

				const user = await ctx.prisma.user.findUnique({
					where: {
						email: session.user.email as string
					}
				});

				if (!user)
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'User not found'
					});

				return { data: user };
			}
		}),

	getOtp: publicProcedure
		.input(z.object({ email: z.string(), otp: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { email, otp } = input;

			const userOTP = await ctx.prisma.userOTP.findUnique({
				where: {
					code: otp,
					user: {
						email: email
					}
				}
			});

			if (!userOTP) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invalid OTP'
				});
			} else {
				const now = new Date();
				if (now.getTime() > userOTP.expiration_date.getTime()) {
					await ctx.prisma.userOTP.delete({
						where: {
							code: otp
						}
					});
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Expired OTP'
					});
				} else {
					return { data: { id: userOTP.id } };
				}
			}
		})
});
