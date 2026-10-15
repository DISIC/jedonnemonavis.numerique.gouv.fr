import { checkRightToProceed } from '../product';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const createReviewViewInputSchema = z
	.object({
		product_id: z.number().int(),
		form_id: z.number().int().optional()
	})
	.strict();

export const createReviewViewMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createReviewViewInputSchema>;
}) => {
	const { product_id, form_id } = input;

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id,
		authorizeCarrierUser: true
	});

	if (form_id !== undefined) {
		const form = await ctx.prisma.form.findFirst({
			where: { id: form_id, product_id },
			select: { id: true }
		});

		if (!form)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Form not found for this product'
			});
	}

	const userEvent = await ctx.prisma.userEvent.create({
		data: {
			user_id: parseInt(ctx.session!.user.id),
			action: 'service_new_reviews_view',
			product_id,
			form_id: form_id ?? null,
			metadata: {}
		}
	});

	return { data: userEvent };
};
