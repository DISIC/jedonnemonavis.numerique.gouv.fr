import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import {
	UserCreateInputSchema,
	UserUpdateInputSchema
} from '@/prisma/generated/zod';
import crypto from 'crypto';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
	extractDomainFromEmail,
	generateRandomString
} from '@/src/utils/tools';
import { sendMail } from '@/src/utils/mailer';
import {
	getOTPEmailHtml,
	getRegisterEmailHtml,
	getResetPasswordEmailHtml
} from '@/src/utils/emails';

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
			//60mn validity
			expiration_date: new Date(now.getTime() + 60 * 60 * 1000)
		}
	});

	await sendMail(
		'Votre mot de passe temporaire',
		user.email.toLowerCase(),
		getOTPEmailHtml(code),
		`Votre mot de passe temporaire valable 60 minutes : ${code}`
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

	const updatedUser = await prisma.user.update({
		where: {
			id: userOTP.user.id
		},
		data: {
			...user,
			email: user.email.toLowerCase()
		}
	});

	await prisma.userOTP.delete({
		where: {
			code: otp
		}
	});

	return { ...updatedUser, password: 'Nice try!' };
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
			user_email_invite: user.email.toLowerCase()
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
				user_email: user.email.toLowerCase()
			}
		});
	}

	const userInvitesEntity = await prisma.adminEntityRight.findMany({
		where: {
			user_email_invite: user.email.toLowerCase()
		}
	});

	if (userInvitesEntity.length > 0) {
		await prisma.adminEntityRight.updateMany({
			where: {
				id: {
					in: userInvitesEntity.map(invite => invite.id)
				}
			},
			data: {
				user_email: user.email.toLowerCase()
			}
		});
	}
}

export async function checkUserDomain(prisma: PrismaClient, email: string) {
	const domain = extractDomainFromEmail(email.toLowerCase());
	if (!domain) return false;

	const domainWhiteListed = await prisma.whiteListedDomain.findFirst({
		where: { domain }
	});
	return !!domainWhiteListed || domain.endsWith(".gouv.fr");;
}

export const userRouter = router({
	getList: protectedProcedure
		.meta({ isAdmin: true })
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

			let orderBy: Prisma.UserOrderByWithAggregationInput[] = [
				{
					email: 'asc'
				}
			];

			let where: Prisma.UserWhereInput = {
				OR: [
					{
						UserRequests: {
							some: {
								status: 'accepted'
							}
						}
					},
					{
						UserRequests: {
							none: {}
						}
					}
				]
			};

			if (search) {
				if (search.includes(' ')) {
					const [firstName, lastName] = search.toLowerCase().split(' ');
					where.OR = [
						{
							firstName: { contains: firstName, mode: 'insensitive' },
							lastName: { contains: lastName, mode: 'insensitive' }
						},
						{
							firstName: { contains: lastName, mode: 'insensitive' },
							lastName: { contains: firstName, mode: 'insensitive' }
						}
					];
				} else {
					where.OR = [
						{
							firstName: { contains: search, mode: 'insensitive' },
						},
						{
							lastName: { contains: search, mode: 'insensitive' }
						},
						{
							email: { contains: search, mode: 'insensitive' }
						}
					];
				}
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

	create: protectedProcedure
		.meta({ isAdmin: true })
		.input(UserCreateInputSchema)
		.mutation(async ({ ctx, input: newUser }) => {
			const userExists = await ctx.prisma.user.findUnique({
				where: {
					email: newUser.email.toLowerCase()
				}
			});

			if (userExists)
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'User with email already exists'
				});

			const hashedPassword = crypto
				.createHash('sha256')
				.update(newUser.password)
				.digest('hex');

			newUser.password = hashedPassword;

			const createdUser = await ctx.prisma.user.create({
				data: {
					...newUser,
					email: newUser.email.toLowerCase(),
					active: true
				}
			});

			return { data: createdUser };
		}),

	update: protectedProcedure
		.meta({ isAdmin: true })
		.input(z.object({ id: z.number(), user: UserUpdateInputSchema }))
		.mutation(async ({ ctx, input }) => {
			const { id, user } = input;
			const updatedUser = await ctx.prisma.user.update({
				where: { id },
				data: { ...user, email: ((user.email || '') as string).toLowerCase() }
			});

			return { data: updatedUser };
		}),

	delete: protectedProcedure
		.meta({ isAdmin: true })
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const deletedUser = await ctx.prisma.user.delete({
				where: { id }
			});

			return { data: deletedUser };
		}),

	deleteMany: protectedProcedure
		.meta({ isAdmin: true })
		.input(z.object({ ids: z.array(z.number()) }))
		.mutation(async ({ ctx, input }) => {
			const { ids } = input;

			const deletedUser = await ctx.prisma.user.deleteMany({
				where: { id: {in: ids} }
			});

			return { data: deletedUser };
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
			const { xwiki_account, ...newUser } = user;

			const hashedPassword = crypto
				.createHash('sha256')
				.update(newUser.password)
				.digest('hex');

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
						email: newUser.email.toLowerCase()
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
						createdUser.email.toLowerCase(),
						getRegisterEmailHtml(token),
						`Cliquez sur ce lien pour valider votre compte : ${process.env.NODEMAILER_BASEURL}/register/validate?${new URLSearchParams({ token })}`
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
					{
						...userValidationToken.user,
						active: true
					}
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
					email: email.toLowerCase()
				}
			});

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found'
				});
			} else if (user.xwiki_account && !user.active) {
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
						email: email.toLowerCase()
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
		}),

	initResetPwd: publicProcedure
		.input(z.object({ email: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { email } = input;

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
					token,
					user_email: user.email.toLowerCase(),
					expiration_date: new Date(new Date().getTime() + 15 * 60 * 1000)
				}
			});

			await sendMail(
				'Mot de passe oublié',
				email.toLowerCase(),
				getResetPasswordEmailHtml(token),
				`Cliquez sur ce lien pour réinitialiser votre mot de passe : ${
					process.env.NODEMAILER_BASEURL
				}/reset-password?${new URLSearchParams({ token })}`
			);

			return { data: token };
		}),

	checkToken: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ ctx, input }) => {
			const { token } = input;

			const userResetToken = await ctx.prisma.userResetToken.findUnique({
				where: {
					token
				}
			});

			if (!userResetToken) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invalid token'
				});
			}

			const now = new Date();
			if (now.getTime() > userResetToken.expiration_date.getTime()) {
				await ctx.prisma.userResetToken.delete({
					where: {
						token
					}
				});
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Expired token'
				});
			}

			return { data: userResetToken };
		}),

	changePAssword: publicProcedure
		.input(z.object({ token: z.string(), password: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { token, password } = input;

			const userResetToken = await ctx.prisma.userResetToken.findUnique({
				where: {
					token
				}
			});

			if (!userResetToken) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Invalid token'
				});
			}

			const now = new Date();
			if (now.getTime() > userResetToken.expiration_date.getTime()) {
				await ctx.prisma.userResetToken.delete({
					where: {
						token
					}
				});
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Expired token'
				});
			}

			const hashedPassword = crypto
				.createHash('sha256')
				.update(password)
				.digest('hex');

			const updatedUser = await ctx.prisma.user.update({
				where: {
					id: userResetToken.user_id
				},
				data: {
					password: hashedPassword
				}
			});

			await ctx.prisma.userResetToken.delete({
				where: {
					token
				}
			});

			return { data: updatedUser };
		})
});
