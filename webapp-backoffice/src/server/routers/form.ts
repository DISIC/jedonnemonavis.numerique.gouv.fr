import {
	FormUncheckedCreateInputSchema,
	FormUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';
import { protectedProcedure, publicProcedure, router } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from './product';
import { sendMail } from '@/src/utils/mailer';
import { getClosedButtonOrFormEmail } from '@/src/utils/emails';
import { shouldSendEmailsAboutDeletion } from '@/src/utils/tools';

export const formRouter = router({
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const { id } = input;
			const form = await ctx.prisma.form.findUnique({
				where: { id },
				include: {
					form_configs: {
						include: {
							form_config_labels: true,
							form_config_displays: true
						}
					},
					form_template: {
						include: {
							form_template_steps: {
								include: {
									form_template_blocks: {
										include: {
											options: true
										}
									}
								}
							}
						}
					}
				}
			});
			return { data: form };
		}),

	getFormTemplateBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const { slug } = input;
			const formTemplate = await ctx.prisma.formTemplate.findUnique({
				where: { slug },
				include: {
					form_template_steps: {
						include: {
							form_template_blocks: {
								include: {
									options: true
								}
							}
						}
					}
				}
			});
			return { data: formTemplate };
		}),
	create: protectedProcedure
		.meta({ logEvent: true })
		.input(FormUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input: formPayload }) => {
			const form = await ctx.prisma.form.create({
				data: {
					...formPayload
				}
			});

			return { data: form };
		}),
	update: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({
				id: z.number(),
				form: FormUncheckedUpdateInputSchema.and(
					z.object({
						product_id: z.number()
					})
				)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, form } = input;

			await checkRightToProceed({
				prisma: ctx.prisma,
				session: ctx.session,
				product_id: form.product_id
			});

			const updatedForm = await ctx.prisma.form.update({
				where: { id },
				data: {
					...form
				},
				include: { form_template: true }
			});

			return { data: updatedForm };
		}),
	delete: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({
				id: z.number(),
				product_id: z.number(),
				form: FormUncheckedUpdateInputSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, form, product_id } = input;

			const { product } = await checkRightToProceed({
				prisma: ctx.prisma,
				session: ctx.session,
				product_id: product_id
			});

			const currentForm = await ctx.prisma.form.findUnique({
				where: { id: input.id as number },
				select: { isDeleted: true }
			});

			const deletedForm = await ctx.prisma.form.update({
				where: { id },
				data: {
					...form
				},
				include: { form_template: true }
			});

			if (
				shouldSendEmailsAboutDeletion(
					currentForm?.isDeleted,
					deletedForm.isDeleted
				)
			) {
				const accessRights = await ctx.prisma.accessRight.findMany({
					where: {
						product_id: deletedForm.product_id
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

				emails.forEach((email: string) => {
					sendMail(
						`Fermeture du formulaire «${deletedForm.title ?? deletedForm.form_template.title}» du service «${product?.title}»`,
						email,
						getClosedButtonOrFormEmail({
							contextUser: ctx.session.user,
							formTitle: deletedForm.title ?? deletedForm.form_template.title,
							form: {
								id: deletedForm.id,
								title: deletedForm.title ?? deletedForm.form_template.title
							},
							product: {
								id: product?.id as number,
								title: product?.title as string,
								entityName: product?.entity.name as string
							}
						}),
						`Fermeture du formulaire «${deletedForm.title || deletedForm.form_template.title}» du service «${product?.title}»`
					);
				});
			}

			return { data: deletedForm };
		})
});
