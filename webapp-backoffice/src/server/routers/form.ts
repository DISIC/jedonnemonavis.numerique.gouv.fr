import { protectedProcedure, router } from '@/src/server/trpc';
import { z } from 'zod';

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
		})
});
