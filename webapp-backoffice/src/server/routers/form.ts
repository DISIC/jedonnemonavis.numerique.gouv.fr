import {
	FormUncheckedCreateInputSchema,
	FormUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';
import { protectedProcedure, publicProcedure, router } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from './product';
import { sendMail } from '@/src/utils/mailer';
import { getClosedButtonOrFormEmail } from '@/src/utils/emails';

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

			const { product } = await checkRightToProceed({
				prisma: ctx.prisma,
				session: ctx.session,
				product_id: form.product_id
			});

			const currentForm = await ctx.prisma.form.findUnique({
				where: { id: input.id as number },
				select: { deleted_at: true }
			});

			const updatedForm = await ctx.prisma.form.update({
				where: { id },
				data: {
					...form
				},
				include: { form_template: true }
			});
			const hasBeenClosed =
				currentForm?.deleted_at === null && updatedForm.deleted_at !== null;
			if (hasBeenClosed) {
				const accessRights = await ctx.prisma.accessRight.findMany({
					where: {
						product_id: updatedForm.product_id
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
						`Fermeture du formulaire «${updatedForm.title ?? updatedForm.form_template.title}» du service «${product?.title}»`,
						email,
						getClosedButtonOrFormEmail({
							contextUser: ctx.session.user,
							formTitle: updatedForm.title ?? updatedForm.form_template.title,
							form: {
								id: updatedForm.id,
								title: updatedForm.title ?? updatedForm.form_template.title
							},
							product: {
								id: product?.id as number,
								title: product?.title as string,
								entityName: product?.entity.name as string
							}
						}),
						`Fermeture du formulaire «${updatedForm.title || updatedForm.form_template.title}» du service «${product?.title}»`
					);
				});
			}

			return { data: updatedForm };
		})
});
