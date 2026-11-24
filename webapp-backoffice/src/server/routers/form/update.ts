import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product';
import { FORM_INCLUDE } from './constants';

export const updateFormInputSchema = z.object({
	id: z.number(),
	form: z.object({
		title: z.string().nullish(),
		// Produit attendu par l'appelant, comparé au produit réel du formulaire.
		product_id: z.number()
	})
});

export const updateFormMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateFormInputSchema>;
}) => {
	const { id, form } = input;

	const currentForm = await ctx.prisma.form.findUnique({
		where: { id },
		select: { product_id: true }
	});

	if (!currentForm) {
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' });
	}

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		form_id: id
	});

	if (form.product_id !== currentForm.product_id) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Form does not belong to this product'
		});
	}

	const updatedForm = await ctx.prisma.form.update({
		where: { id },
		data: {
			title: form.title
		},
		include: FORM_INCLUDE
	});

	return { data: updatedForm };
};
