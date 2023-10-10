import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { sendMail } from '@/src/utils/mailer';
import {
	generateRandomString,
	getInviteEmailHtml,
	getUserInviteEmailHtml
} from '@/src/utils/tools';
import { AccessRightUncheckedUpdateInputSchema } from '@/prisma/generated/zod';

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
				status: isRemoved ? undefined : 'carrier'
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

	create: protectedProcedure
		.input(
			z.object({
				user_email: z.string().email(),
				product_id: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const contextUser = ctx.session.user;
			const { user_email, product_id } = input;

			const accessRightAlreadyExists = await ctx.prisma.accessRight.findFirst({
				where: {
					user_email,
					product_id
				}
			});

			if (accessRightAlreadyExists !== null)
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Access right already exists'
				});

			const userExists = await ctx.prisma.user.findUnique({
				where: {
					email: user_email
				}
			});

			const newAccessRight = await ctx.prisma.accessRight.create({
				data: {
					user_email: userExists ? user_email : null,
					user_email_invite: !userExists ? user_email : null,
					product_id
				},
				include: {
					user: true,
					product: true
				}
			});

			if (newAccessRight.user === null) {
				const token = generateRandomString(32);

				await ctx.prisma.userInviteToken.create({
					data: {
						user_email,
						token
					}
				});

				await sendMail(
					'Invitation à rejoindre "Je donne mon avis"',
					user_email,
					getUserInviteEmailHtml(
						user_email,
						token,
						newAccessRight.product.title
					),
					`Cliquez sur ce lien pour créer votre compte : ${
						process.env.NODEMAILER_BASEURL
					}/register?${new URLSearchParams({
						email: user_email,
						inviteToken: token
					})}`
				);
			} else {
				await sendMail(
					`Invitation à rejoindre le produit numérique "${newAccessRight.product.title}" sur "Je donne mon avis"`,
					user_email,
					getInviteEmailHtml(contextUser, newAccessRight.product.title),
					`Cliquez sur ce lien pour rejoindre le produit numérique "${newAccessRight.product.title}" : ${process.env.NODEMAILER_BASEURL}`
				);
			}

			return { data: newAccessRight };
		}),

	update: protectedProcedure
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
		})
});
