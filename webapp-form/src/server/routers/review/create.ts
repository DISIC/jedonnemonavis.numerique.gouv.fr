import type { Context } from '@/src/server/trpc';
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
	const newReview = await createReview(ctx, input);

	return { data: newReview };
};
