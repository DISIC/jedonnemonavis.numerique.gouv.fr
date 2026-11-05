import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { reviewAnswersInputSchema } from './schemas';
import { createOrUpdateAnswers } from './utils';

export const insertOrUpdateReviewInputSchema = z.object({
	answers: reviewAnswersInputSchema,
	user_id: z.string().max(255),
	product_id: z.number().int(),
	button_id: z.number().int(),
	step_name: z.enum(['satisfaction', 'comprehension', 'verbatim', 'contact'])
});

export const insertOrUpdateReviewMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof insertOrUpdateReviewInputSchema>;
}) => {
	const { user_id, product_id, button_id, answers, step_name } = input;
	const { prisma } = ctx;

	const existingReview = await prisma.review.findFirst({
		where: {
			product_id,
			button_id,
			user_id,
			created_at: {
				gte: new Date(Date.now() - 60 * 60 * 1000)
			}
		},
		include: {
			button: true,
			product: true
		}
	});

	if (existingReview) {
		await createOrUpdateAnswers(ctx, {
			answers: answers,
			review: existingReview,
			step_name
		});

		return { data: existingReview };
	} else {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Review not found'
		});
	}
};
