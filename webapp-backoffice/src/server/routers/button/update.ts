import {
	ButtonIntegrationTypesSchema,
	FormTemplateButtonStyleSchema
} from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const updateButtonInputSchema = z.object({
	id: z.number(),
	// Formulaire attendu par l'appelant, comparé au formulaire réel du bouton.
	form_id: z.number().optional(),
	title: z.string().optional(),
	form_template_button_id: z.number().nullish(),
	button_style: FormTemplateButtonStyleSchema.nullish(),
	integration_type: ButtonIntegrationTypesSchema.nullish()
});

export const updateButtonMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateButtonInputSchema>;
}) => {
	const { id, form_id, ...data } = input;

	const currentButton = await ctx.prisma.button.findUnique({
		where: { id },
		select: { form_id: true }
	});

	if (!currentButton) {
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Button not found' });
	}

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		form_id: currentButton.form_id
	});

	if (form_id !== undefined && form_id !== currentButton.form_id) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Button form cannot be changed'
		});
	}

	const updatedButton = await ctx.prisma.button.update({
		where: { id },
		data: {
			title: data.title,
			form_template_button_id: data.form_template_button_id,
			button_style: data.button_style,
			integration_type: data.integration_type
		},
		include: {
			form: { include: { form_template: true } },
			form_template_button: {
				include: {
					variants: true
				}
			}
		}
	});

	return { data: updatedButton };
};
