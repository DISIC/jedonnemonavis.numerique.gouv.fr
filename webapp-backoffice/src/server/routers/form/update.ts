import { FormUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from '../product';
import { FORM_INCLUDE } from './constants';

export const updateFormInputSchema = z.object({
	id: z.number(),
	form: FormUncheckedUpdateInputSchema.and(
		z.object({
			product_id: z.number()
		})
	)
});

export const updateFormMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateFormInputSchema>;
}) => {
	const { id, form } = input;

	// Passing both makes checkRightToProceed verify that form `id` really
	// belongs to the claimed product, so this mutation cannot reparent a form
	// of another tenant.
	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id: form.product_id,
		form_id: id
	});

	// Statistics visibility is only ever writable through form.setVisibility,
	// which enforces the hasStats / isTop250 rules and records an audit event;
	// isTop250 itself belongs to the Top250 API. Never let the generic form
	// payload carry either flag.
	const { isPublic: _isPublic, isTop250: _isTop250, ...formData } = form;

	const updatedForm = await ctx.prisma.form.update({
		where: { id },
		data: {
			...formData
		},
		include: FORM_INCLUDE
	});

	return { data: updatedForm };
};
