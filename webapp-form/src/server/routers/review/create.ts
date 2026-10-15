import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { reviewAnswersInputSchema, reviewInputSchema } from './schemas';
import { createReview } from './utils';

export const createReviewInputSchema = z.object({
	review: reviewInputSchema,
	answers: reviewAnswersInputSchema
});

export const createReviewMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createReviewInputSchema>;
}) => {
	const { review } = input;

	const button = await ctx.prisma.button.findFirst({
		where: {
			id: review.button_id,
			form_id: review.form_id,
			form: { product_id: review.product_id }
		},
		select: { id: true }
	});

	if (!button) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Invalid integration link'
		});
	}

	const newReview = await createReview(ctx, input);

	return { data: newReview };
};
