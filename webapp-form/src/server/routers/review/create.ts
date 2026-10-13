import {
	AnswerCreateInputSchema,
	ReviewUncheckedCreateInputSchema
} from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { createReview } from './utils';

export const createReviewInputSchema = z.object({
	review: ReviewUncheckedCreateInputSchema.and(
		z.object({
			button_id: z.number().int(),
			requested_button_id: z.undefined()
		})
	),
	answers: z.array(AnswerCreateInputSchema)
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
