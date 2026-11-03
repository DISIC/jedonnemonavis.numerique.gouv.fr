import {
	ButtonIntegrationTypesSchema,
	FormTemplateButtonStyleSchema
} from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const createButtonInputSchema = z.object({
	title: z.string(),
	form_id: z.number(),
	description: z.string().nullish(),
	isTest: z.boolean().nullish(),
	form_template_button_id: z.number().nullish(),
	button_style: FormTemplateButtonStyleSchema.nullish(),
	integration_type: ButtonIntegrationTypesSchema.nullish()
});

export const createButtonMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createButtonInputSchema>;
}) => {
	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		form_id: input.form_id
	});

	const newButton = await ctx.prisma.button.create({
		data: {
			title: input.title,
			form_id: input.form_id,
			description: input.description,
			isTest: input.isTest ?? undefined,
			form_template_button_id: input.form_template_button_id,
			button_style: input.button_style,
			integration_type: input.integration_type
		},
		include: {
			form: {
				include: {
					form_template: true
				}
			},
			form_template_button: {
				include: {
					variants: true
				}
			}
		}
	});

	return { data: newButton };
};
