import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getFormTemplateBySlugInputSchema = z.object({
	slug: z.string()
});

export const getFormTemplateBySlugQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getFormTemplateBySlugInputSchema>;
}) => {
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
			},
			form_template_buttons: { include: { variants: true } }
		}
	});

	return { data: formTemplate };
};
