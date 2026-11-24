import {
	FormConfigKindSchema,
	FormConfigStatusSchema
} from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

const formConfigDisplayInputSchema = z.object({
	hidden: z.boolean(),
	kind: FormConfigKindSchema,
	parent_id: z.number().int()
});

const formConfigLabelInputSchema = z.object({
	label: z.string(),
	kind: FormConfigKindSchema,
	parent_id: z.number().int()
});

export const createFormConfigInputSchema = z.object({
	form_id: z.number(),
	status: FormConfigStatusSchema,
	version: z.number().int().nullish(),
	form_config_displays: z
		.object({ create: z.array(formConfigDisplayInputSchema) })
		.optional(),
	form_config_labels: z
		.object({ create: z.array(formConfigLabelInputSchema) })
		.optional()
});

export type CreateFormConfigInput = z.infer<typeof createFormConfigInputSchema>;

export const createFormConfigMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: CreateFormConfigInput;
}) => {
	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		form_id: input.form_id
	});

	const createdFormConfig = await ctx.prisma.formConfig.create({
		data: {
			form_id: input.form_id,
			status: input.status,
			version: input.version,
			user_id: parseInt(ctx.session!.user.id),
			form_config_displays: input.form_config_displays,
			form_config_labels: input.form_config_labels
		},
		include: {
			form_config_displays: true,
			form_config_labels: true,
			form: true
		}
	});
	return { data: createdFormConfig };
};
