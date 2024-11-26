import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { UserEventUncheckedCreateInputSchema } from '@/prisma/generated/zod';

export const userEventRouter = router({
	getLastReviewView: protectedProcedure
		.input(
			z.object({
				product_id: z.number().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id } = input;

			let where: Prisma.UserEventWhereInput = {
			};

			if (product_id) {
				where = {
					user_id: parseInt(ctx.session?.user?.id),
					action: 'service_new_reviews_view',
					product_id: product_id
				}
			}

			const reviewViewLog = await ctx.prisma.userEvent.findMany({
				where,
				orderBy: {
					created_at: 'desc'
				},
				take: 1
			});

			return { data: reviewViewLog };
		}),


	createReviewView: protectedProcedure
	.input(UserEventUncheckedCreateInputSchema)
	.mutation(async ({ ctx, input }) => {
		const newButton = await ctx.prisma.userEvent.create({
			data: input
		});

		return { data: newButton };
	}),
});
