import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const createReviewViewLogInputSchema = z.object({
	review_id: z.number(),
	review_created_at: z.date()
});

export const createReviewViewLogMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createReviewViewLogInputSchema>;
}) => {
	const { review_id, review_created_at } = input;

	const reviewViewLog = await ctx.prisma.reviewViewLog.create({
		data: {
			user_id: parseInt(ctx.session!.user.id),
			review_id,
			review_created_at
		}
	});

	return { data: reviewViewLog };
};
