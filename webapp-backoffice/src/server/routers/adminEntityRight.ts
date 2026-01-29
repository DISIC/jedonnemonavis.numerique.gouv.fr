import { AdminEntityRightUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import { protectedProcedure, router } from '@/src/server/trpc';
import { sendMail } from '@/src/utils/mailer';
import { renderInviteEmail, renderUserInviteEmail } from '@/src/utils/emails';
import { generateRandomString } from '@/src/utils/tools';
import { Prisma, PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

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

	getUserList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1)
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page } = input;

			let where: Prisma.AdminEntityRightWhereInput = {
				user: {
					id: parseInt(ctx.session.user.id)
				}
			};

			const adminEntityRights = await ctx.prisma.adminEntityRight.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage
			});

			const count = await ctx.prisma.adminEntityRight.count({ where });

			return { data: adminEntityRights, metadata: { count } };
		}),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({
				user_email: z.string().email(),
				entity_id: z.number(),
				entity_name: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const contextUser = ctx.session.user;
			const { user_email, entity_id } = input;

			const adminEntityRightAlreadyExists =
				await ctx.prisma.adminEntityRight.findFirst({
					where: {
						OR: [
							{ user_email: user_email.toLowerCase() },
							{ user_email_invite: user_email.toLowerCase() }
						],
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
					email: user_email.toLowerCase()
				}
			});

			const newAdminEntityRight = await ctx.prisma.adminEntityRight.create({
				data: {
					user_email: userExists ? user_email.toLowerCase() : null,
					user_email_invite: !userExists ? user_email.toLowerCase() : null,
					entity_id
				},
				include: {
					user: true,
					entity: true
				}
			});

			if (newAdminEntityRight.user === null) {
				const token = await generateInviteToken(ctx.prisma, user_email);
				const emailHtml = await renderUserInviteEmail({
					inviterName: contextUser.name || "Quelqu'un",
					recipientEmail: user_email.toLowerCase(),
					inviteToken: token,
					entityName: newAdminEntityRight.entity.name,
					baseUrl: process.env.NODEMAILER_BASEURL
				});

				console.log('Trying to send invite mail to:', {
					toEmail: user_email.toLowerCase(),
					emailHtml,
					inviteTitle: `Cliquez sur ce lien pour créer votre compte : ${
						process.env.NODEMAILER_BASEURL
					}/register?${new URLSearchParams({
						email: user_email.toLowerCase(),
						inviteToken: token
					})}`
				});
				await sendMail(
					'Invitation à rejoindre « Je donne mon avis »',
					user_email.toLowerCase(),
					emailHtml,
					`Cliquez sur ce lien pour créer votre compte : ${
						process.env.NODEMAILER_BASEURL
					}/register?${new URLSearchParams({
						email: user_email.toLowerCase(),
						inviteToken: token
					})}`
				);
			} else {
				const emailHtml = await renderInviteEmail({
					inviterName: contextUser.name || "Quelqu'un",
					entityName: newAdminEntityRight.entity.name,
					baseUrl: process.env.NODEMAILER_BASEURL
				});
				await sendMail(
					`Accès à l'organisation « ${newAdminEntityRight.entity.name} » sur la plateforme « Je donne mon avis »`,
					user_email.toLowerCase(),
					emailHtml,
					`Cliquez sur ce lien pour rejoindre l'organisation "${newAdminEntityRight.entity.name}" : ${process.env.NODEMAILER_BASEURL}`
				);
			}

			await ctx.prisma.accessRight.deleteMany({
				where: {
					OR: [
						{ user_email: user_email.toLowerCase() },
						{ user_email_invite: user_email.toLowerCase() }
					],
					product: {
						entity_id
					}
				}
			});

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

			const emailHtml = await renderUserInviteEmail({
				inviterName: contextUser.name || "Quelqu'un",
				recipientEmail: user_email.toLowerCase(),
				inviteToken: token,
				entityName: entity.name,
				baseUrl: process.env.NODEMAILER_BASEURL
			});

			await sendMail(
				'Invitation à rejoindre « Je donne mon avis »',
				user_email.toLowerCase(),
				emailHtml,
				`Cliquez sur ce lien pour créer votre compte : ${
					process.env.NODEMAILER_BASEURL
				}/register?${new URLSearchParams({
					email: user_email.toLowerCase(),
					inviteToken: token
				})}`
			);
		}),

	update: protectedProcedure
		.input(AdminEntityRightUncheckedUpdateInputSchema)
		.meta({ logEvent: true })
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const adminEntityRight = await ctx.prisma.adminEntityRight.update({
				where: {
					id: id as number
				},
				data: data
			});

			return adminEntityRight;
		}),

	delete: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({
				admin_entity_right_id: z.number(),
				entity_name: z.string().optional(),
				entity_id: z.number().optional(),
				user_email: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { admin_entity_right_id } = input;

			const adminEntityRightDelete = await ctx.prisma.adminEntityRight.delete({
				where: {
					id: admin_entity_right_id
				}
			});

			return adminEntityRightDelete;
		})
});
