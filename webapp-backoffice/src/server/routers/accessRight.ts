import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { Prisma, PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { sendMail } from '@/src/utils/mailer';
import { generateRandomString } from '@/src/utils/tools';
import { AccessRightUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import { getInviteEmailHtml, getUserInviteEmailHtml } from '@/src/utils/emails';

export const generateInviteToken = async (
	prisma: PrismaClient,
	userEmail: string
) => {
	const token = generateRandomString(32);

	await prisma.userInviteToken.create({
		data: {
			user_email: userEmail.toLowerCase(),
			token
		}
	});

	return token;
};

export const accessRightRouter = router({
	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				product_id: z.number(),
				isRemoved: z.boolean()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, product_id, isRemoved } = input;

			let where: Prisma.AccessRightWhereInput = {
				product_id,
				status: isRemoved
					? undefined
					: {
							in: ['carrier_user', 'carrier_admin']
						}
			};

			const entities = await ctx.prisma.accessRight.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				include: {
					user: true
				}
			});

			const count = await ctx.prisma.accessRight.count({ where });

			return { data: entities, metadata: { count } };
		}),

	getUserList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1)
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page } = input;

			let where: Prisma.AccessRightWhereInput = {
				user_email: ctx.session.user.email
			};

			const accessRights = await ctx.prisma.accessRight.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				include: {
					user: true
				}
			});

			const count = await ctx.prisma.accessRight.count({ where });

			return { data: accessRights, metadata: { count } };
		}),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({
				user_email: z.string().email(),
				product_id: z.number(),
				role: z.enum(['carrier_user', 'carrier_admin']).optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const contextUser = ctx.session.user;
			const { user_email, product_id, role } = input;

			const accessRightAlreadyExists = await ctx.prisma.accessRight.findFirst({
				where: {
					OR: [
						{ user_email: user_email.toLowerCase() },
						{ user_email_invite: user_email.toLowerCase() }
					],
					product_id
				}
			});

			const adminEntityRightExists =
				await ctx.prisma.adminEntityRight.findFirst({
					where: {
						OR: [
							{ user_email: user_email.toLowerCase() },
							{ user_email_invite: user_email.toLowerCase() }
						],
						entity: {
							products: {
								some: {
									id: product_id
								}
							}
						}
					}
				});

			const userIsSuperAdmin = await ctx.prisma.user.findFirst({
				where: {
					email: user_email,
					role: {
						in: ['admin', 'superadmin']
					}
				}
			});

			if (
				(accessRightAlreadyExists !== null &&
					accessRightAlreadyExists.status === 'carrier') ||
				adminEntityRightExists ||
				userIsSuperAdmin !== null
			) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Access right already exists'
				});
			}

			const userExists = await ctx.prisma.user.findUnique({
				where: {
					email: user_email.toLowerCase()
				}
			});

			const newAccessRight = await ctx.prisma.accessRight.upsert({
				where: {
					id: accessRightAlreadyExists?.id || -1
				},
				update: {
					status: role
				},
				create: {
					user_email: userExists ? user_email.toLowerCase() : null,
					user_email_invite: !userExists ? user_email.toLowerCase() : null,
					status: role,
					product_id
				},
				include: {
					user: true,
					product: true
				}
			});

			if (newAccessRight.user === null) {
				const token = await generateInviteToken(ctx.prisma, user_email);

				await sendMail(
					'Invitation à rejoindre « Je donne mon avis »',
					user_email.toLowerCase(),
					getUserInviteEmailHtml(
						contextUser,
						user_email.toLowerCase(),
						token,
						newAccessRight.product.title
					),
					`Cliquez sur ce lien pour créer votre compte : ${
						process.env.NODEMAILER_BASEURL
					}/register?${new URLSearchParams({
						email: user_email.toLowerCase(),
						inviteToken: token
					})}`
				);
			} else {
				await sendMail(
					`Accès à la démarche « ${newAccessRight.product.title} » sur la plateforme « Je donne mon avis »`,
					user_email.toLowerCase(),
					getInviteEmailHtml(contextUser, newAccessRight.product.title),
					`Cliquez sur ce lien pour rejoindre le produit numérique "${newAccessRight.product.title}" : ${process.env.NODEMAILER_BASEURL}`
				);
			}

			return { data: newAccessRight };
		}),

	resendEmail: protectedProcedure
		.input(z.object({ product_id: z.number(), user_email: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			const { user_email, product_id } = input;
			const contextUser = ctx.session.user;

			const product = await ctx.prisma.product.findUnique({
				where: {
					id: product_id
				}
			});

			if (!product)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found'
				});

			const token = await generateInviteToken(ctx.prisma, user_email);

			await sendMail(
				'Invitation à rejoindre « Je donne mon avis »',
				user_email.toLowerCase(),
				getUserInviteEmailHtml(
					contextUser,
					user_email.toLowerCase(),
					token,
					product.title
				),
				`Cliquez sur ce lien pour créer votre compte : ${
					process.env.NODEMAILER_BASEURL
				}/register?${new URLSearchParams({
					email: user_email.toLowerCase(),
					inviteToken: token
				})}`
			);
		}),

	update: protectedProcedure
		.meta({ logEvent: true })
		.input(AccessRightUncheckedUpdateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const accessRight = await ctx.prisma.accessRight.update({
				where: {
					id: id as number
				},
				data: data
			});

			return accessRight;
		}),

	delete: protectedProcedure
		.meta({ logEvent: true })
		.input(z.object({ access_right_id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { access_right_id } = input;

			const accessRightDelete = await ctx.prisma.accessRight.delete({
				where: {
					id: access_right_id
				}
			});

			return accessRightDelete;
		})
});
