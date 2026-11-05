import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { dynamicAnswersInputSchema } from './schemas';
import { createOrUpdateAnswers, formatDynamicAnswer } from './utils';

export const dynamicInsertOrUpdateReviewInputSchema = z.object({
	review_id: z.number(),
	review_created_at: z.date(),
	answers: dynamicAnswersInputSchema
});

export const dynamicInsertOrUpdateReviewMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof dynamicInsertOrUpdateReviewInputSchema>;
}) => {
	const { prisma } = ctx;
	const { review_id, review_created_at, answers } = input;

	const existingReview = await prisma.review.findUnique({
		where: {
			id_created_at: {
				id: review_id,
				created_at: review_created_at
			}
		},
		include: {
			button: true,
			product: true
		}
	});

	if (!existingReview) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Review not found'
		});
	}

	const formattedAnswers = await Promise.all(
		answers.map(answer => formatDynamicAnswer(prisma, answer))
	);

	await createOrUpdateAnswers(ctx, {
		answers: formattedAnswers,
		review: existingReview
	});

	return { data: existingReview };
};
