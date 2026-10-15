import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { dynamicAnswersInputSchema, dynamicReviewInputSchema } from './schemas';
import {
	assertFormAcceptsReviews,
	createOrUpdateAnswers,
	formatDynamicAnswer,
	resolveReviewButton
} from './utils';
import { onReviewCreated } from '@/src/server/services/alerts/on-review-created';

export const dynamicCreateReviewInputSchema = z.object({
	review: dynamicReviewInputSchema,
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

	await assertFormAcceptsReviews(prisma, review);

	const newReview = await prisma.review.create({
		data: {
			...review,
			...(await resolveReviewButton(prisma, review.form_id, review.button_id))
		},
		include: {
			product: true,
			button: true
		}
	});

	if (newReview.button?.isDeleted)
		await prisma.closedButtonLog.upsert({
			where: { button_id: newReview.button.id },
			update: { count: { increment: 1 } },
			create: { button_id: newReview.button.id }
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
