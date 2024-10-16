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

			const user = await ctx.prisma.user.findUnique({
				where: {
					id: parseInt(ctx.session.user.id)
				}
			});

			const existingReviewViewLog = await ctx.prisma.reviewViewLog.findFirst({
				where: {
					user_id: user?.id,
					review_id,
					review_created_at
				}
			});

			let reviewViewLog;

			if (existingReviewViewLog) {
				return;
			} else {
				reviewViewLog = await ctx.prisma.reviewViewLog.create({
					data: {
						user_id: parseInt(ctx.session.user.id),
						review_id,
						review_created_at
					}
				});
			}

			return reviewViewLog;
		})
});
