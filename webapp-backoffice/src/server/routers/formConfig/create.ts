import { FormConfigUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const createFormConfigInputSchema = FormConfigUncheckedCreateInputSchema;

export const createFormConfigMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createFormConfigInputSchema>;
}) => {
	const createdFormConfig = await ctx.prisma.formConfig.create({
		data: input,
		include: {
			form_config_displays: true,
			form_config_labels: true,
			form: true
		}
	});
	return { data: createdFormConfig };
};
