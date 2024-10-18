import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';

export const reviewViewLogRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				review_id: z.number(),
				review_created_at: z.date()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { review_id, review_created_at } = input;

			const existingReviewViewLog = await ctx.prisma.reviewViewLog.findFirst({
				where: {
					user_id: parseInt(ctx.session.user.id),
					review_id,
					review_created_at
				}
			});

			if (existingReviewViewLog) {
				return {
					data: existingReviewViewLog
				};
			}

			const reviewViewLog = await ctx.prisma.reviewViewLog.create({
				data: {
					user_id: parseInt(ctx.session.user.id),
					review_id,
					review_created_at
				}
			});

			return {
				data: reviewViewLog
			};
		})
});
