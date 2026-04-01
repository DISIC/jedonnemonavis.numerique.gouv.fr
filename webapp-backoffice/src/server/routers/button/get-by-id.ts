import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getButtonByIdInputSchema = z.object({
	id: z.number()
});

export const getButtonByIdQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getButtonByIdInputSchema>;
}) => {
	const { id } = input;

	const button = await ctx.prisma.button.findUnique({
		where: { id },
		include: { form_template_button: { include: { variants: true } } }
	});

	return { data: button };
};
