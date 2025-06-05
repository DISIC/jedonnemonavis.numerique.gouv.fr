import { FormUncheckedCreateInputSchema, FormUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import { protectedProcedure, publicProcedure, router } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from './product';

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
					...formPayload,
				}
			});
			

			return { data: form };
		}),
	update: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({ 
				id: z.number(), 
				form: FormUncheckedUpdateInputSchema.and(z.object({
					product_id: z.number()
				}))
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, form } = input;

			await checkRightToProceed(ctx.prisma, ctx.session, form.product_id);


			const updatedForm = await ctx.prisma.form.update({
				where: { id },
				data: {
					...form
				}
			});

			return { data: updatedForm };
		}),
});
