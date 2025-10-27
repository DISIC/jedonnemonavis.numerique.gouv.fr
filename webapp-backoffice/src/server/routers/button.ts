import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import {
	ButtonUncheckedCreateInputSchema,
	ButtonUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';
import { checkRightToProceed } from './product';
import { sendMail } from '@/src/utils/mailer';
import { renderClosedButtonOrFormEmail } from '@/src/utils/emails';
import { shouldSendEmailsAboutDeletion } from '@/src/utils/tools';

export const buttonRouter = router({
	getList: publicProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				form_id: z.number().optional(),
				isTest: z.boolean(),
				filterByTitle: z.string().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, form_id, isTest, filterByTitle } = input;

			let where: Prisma.ButtonWhereInput = {
				isTest: {
					equals: !isTest ? false : undefined
				}
			};

			if (form_id) {
				where.form_id = form_id;
			}

			const entities = await ctx.prisma.button.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				orderBy: {
					title: filterByTitle === 'title:asc' ? 'asc' : 'desc'
				},
				include: {
					form: true,
					closedButtonLog: true
				}
			});

			const count = await ctx.prisma.button.count({ where });

			return { data: entities, metadata: { count } };
		}),

	getById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const { id } = input;

			const button = await ctx.prisma.button.findUnique({
				where: {
					id
				}
			});

			return { data: button };
		}),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(ButtonUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
			await checkRightToProceed({
				prisma: ctx.prisma,
				session: ctx.session,
				form_id: input.form_id as number
			});
			const newButton = await ctx.prisma.button.create({
				data: input,
				include: {
					form: true
				}
			});

			return { data: newButton };
		}),

	update: protectedProcedure
		.meta({ logEvent: true })
		.input(ButtonUncheckedUpdateInputSchema)
		.mutation(async ({ ctx, input }) => {
			await checkRightToProceed({
				prisma: ctx.prisma,
				session: ctx.session,
				form_id: input.form_id as number
			});

			const updatedButton = await ctx.prisma.button.update({
				where: {
					id: input.id as number
				},
				data: input,
				include: {
					form: { include: { form_template: true } }
				}
			});

			return { data: updatedButton };
		}),
	delete: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({
				buttonPayload: ButtonUncheckedUpdateInputSchema,
				shouldLogEvent: z.boolean().optional(),
				product_id: z.number(),
				title: z.string()
			})
		)
		.mutation(async ({ ctx, input: initialInput }) => {
			const { buttonPayload } = initialInput;
			const { product } = await checkRightToProceed({
				prisma: ctx.prisma,
				session: ctx.session,
				form_id: buttonPayload.form_id as number
			});

			const currentButton = await ctx.prisma.button.findUnique({
				where: { id: buttonPayload.id as number },
				select: { isDeleted: true }
			});

			const deletedButton = await ctx.prisma.button.update({
				where: {
					id: buttonPayload.id as number
				},
				data: buttonPayload,
				include: {
					form: { include: { form_template: true } }
				}
			});

			if (
				shouldSendEmailsAboutDeletion(
					currentButton?.isDeleted,
					deletedButton.isDeleted,
					deletedButton.form.isDeleted
				)
			) {
				const accessRights = await ctx.prisma.accessRight.findMany({
					where: {
						product_id: deletedButton.form.product_id
					}
				});

				const adminEntityRights = await ctx.prisma.adminEntityRight.findMany({
					where: {
						entity_id: product?.entity_id
					}
				});

				const emails = [
					...accessRights.map(ar => ar.user_email),
					...adminEntityRights.map(aer => aer.user_email)
				].filter(email => email !== null) as string[];

				for (const email of emails) {
					const emailHtml = await renderClosedButtonOrFormEmail({
						userName: ctx.session.user.name || "Quelqu'un",
						buttonTitle: deletedButton.title,
						form: {
							id: deletedButton.form.id,
							title:
								deletedButton.form.title ??
								deletedButton.form.form_template.title
						},
						product: {
							id: product?.id as number,
							title: product?.title as string,
							entityName: product?.entity.name as string
						},
						baseUrl: process.env.NODEMAILER_BASEURL
					});

					await sendMail(
						`Fermeture du lien d'intégration «${deletedButton.title}» du service «${product?.title}»`,
						email,
						emailHtml,
						`Fermeture du lien d'intégration «${deletedButton.title}» du service «${product?.title}»`
					);
				}
			}

			return { data: deletedButton };
		})
});
