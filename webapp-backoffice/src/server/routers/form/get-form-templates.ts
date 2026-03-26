import type { Context } from '@/src/server/trpc';

export const getFormTemplatesQuery = async ({ ctx }: { ctx: Context }) => {
	const formTemplates = await ctx.prisma.formTemplate.findMany({
		include: {
			form_template_steps: {
				include: {
					form_template_blocks: {
						include: {
							options: true
						},
						orderBy: {
							position: 'asc'
						}
					}
				},
				orderBy: {
					position: 'asc'
				}
			},
			form_template_buttons: { include: { variants: true } }
		}
	});

	return { data: formTemplates };
};
