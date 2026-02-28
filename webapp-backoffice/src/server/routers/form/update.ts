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

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session,
		product_id: form.product_id
	});

	const updatedForm = await ctx.prisma.form.update({
		where: { id },
		data: {
			...form
		},
		include: FORM_INCLUDE
	});

	return { data: updatedForm };
};
