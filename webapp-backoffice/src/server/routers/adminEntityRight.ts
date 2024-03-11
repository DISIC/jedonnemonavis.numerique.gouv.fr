import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { Prisma, PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { sendMail } from '@/src/utils/mailer';
import { generateRandomString } from '@/src/utils/tools';
import { AdminEntityRightUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import { getInviteEmailHtml, getUserInviteEmailHtml } from '@/src/utils/emails';

export const generateInviteToken = async (
	prisma: PrismaClient,
	userEmail: string
) => {
	const token = generateRandomString(32);

	await prisma.userInviteToken.create({
		data: {
			user_email: userEmail,
			token
		}
	});

	return token;
};

export const adminEntityRightRouter = router({
	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				entity_id: z.number()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, entity_id } = input;

			let where: Prisma.AdminEntityRightWhereInput = {
				entity_id
			};

			const entities = await ctx.prisma.adminEntityRight.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				include: {
					user: true
				}
			});

			const count = await ctx.prisma.adminEntityRight.count({ where });

			return { data: entities, metadata: { count } };
		}),

	create: protectedProcedure
		.input(
			z.object({
				user_email: z.string().email(),
				entity_id: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const contextUser = ctx.session.user;
			const { user_email, entity_id } = input;

			const adminEntityRightAlreadyExists =
				await ctx.prisma.adminEntityRight.findFirst({
					where: {
						OR: [{ user_email }, { user_email_invite: user_email }],
						entity_id
					}
				});

			if (adminEntityRightAlreadyExists !== null) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Access right already exists'
				});
			}

			const userExists = await ctx.prisma.user.findUnique({
				where: {
					email: user_email
				}
			});

			const newAdminEntityRight = await ctx.prisma.adminEntityRight.create({
				data: {
					user_email: userExists ? user_email : null,
					user_email_invite: !userExists ? user_email : null,
					entity_id
				},
				include: {
					user: true,
					entity: true
				}
			});

			if (newAdminEntityRight.user === null) {
				const token = await generateInviteToken(ctx.prisma, user_email);

				await sendMail(
					'Invitation à rejoindre « Je donne mon avis »',
					user_email,
					getUserInviteEmailHtml(
						contextUser,
						user_email,
						token,
						newAdminEntityRight.entity.name
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
					`Accès à l'organisation « ${newAdminEntityRight.entity.name} » sur la plateforme « Je donne mon avis »`,
					user_email,
					getInviteEmailHtml(contextUser, newAdminEntityRight.entity.name),
					`Cliquez sur ce lien pour rejoindre l'organisation "${newAdminEntityRight.entity.name}" : ${process.env.NODEMAILER_BASEURL}`
				);
			}

			return { data: newAdminEntityRight };
		}),

	resendEmail: protectedProcedure
		.input(z.object({ entity_id: z.number(), user_email: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			const { user_email, entity_id } = input;
			const contextUser = ctx.session.user;

			const entity = await ctx.prisma.entity.findUnique({
				where: {
					id: entity_id
				}
			});

			if (!entity)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Entity not found'
				});

			const token = await generateInviteToken(ctx.prisma, user_email);

			await sendMail(
				'Invitation à rejoindre « Je donne mon avis »',
				user_email,
				getUserInviteEmailHtml(contextUser, user_email, token, entity.name),
				`Cliquez sur ce lien pour créer votre compte : ${
					process.env.NODEMAILER_BASEURL
				}/register?${new URLSearchParams({
					email: user_email,
					inviteToken: token
				})}`
			);
		}),

	update: protectedProcedure
		.input(AdminEntityRightUncheckedUpdateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const adminEntityRight = await ctx.prisma.adminEntityRight.update({
				where: {
					id: id as number
				},
				data: data
			});

			return adminEntityRight;
		})
});
