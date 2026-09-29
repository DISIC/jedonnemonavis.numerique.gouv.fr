import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { dynamicAnswersInputSchema, reviewInputSchema } from './schemas';
import { createOrUpdateAnswers, formatDynamicAnswer } from './utils';
import { onReviewCreated } from '@/src/server/services/alerts/on-review-created';

export const dynamicCreateReviewInputSchema = z.object({
	review: reviewInputSchema,
	answers: dynamicAnswersInputSchema
});

export const dynamicCreateReviewMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof dynamicCreateReviewInputSchema>;
}) => {
	const { prisma } = ctx;
	const { review, answers } = input;

	const newReview = await prisma.review.create({
		data: {
			product_id: review.product_id,
			button_id: review.button_id,
			form_id: review.form_id,
			user_id: review.user_id
		},
		include: {
			product: true,
			button: true
		}
	});

	const formattedAnswers = await Promise.all(
		answers.map(answer => formatDynamicAnswer(prisma, answer))
	);

	try {
		await createOrUpdateAnswers(ctx, {
			answers: formattedAnswers,
			review: newReview
		});
	} catch (e) {
		console.log(e);
	}

	void onReviewCreated(prisma, newReview.form_id);

	return { data: newReview };
};
