import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getLastReviewViewInputSchema = z.object({
	product_id: z.number().optional()
});

export const getLastReviewViewQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getLastReviewViewInputSchema>;
}) => {
	const { product_id } = input;

	let where: Prisma.UserEventWhereInput = {};

	if (product_id) {
		where = {
			user_id: parseInt(ctx.session!.user.id),
			action: 'service_reviews_view',
			product_id: product_id
		};
	}

	const reviewViewLog = await ctx.prisma.userEvent.findMany({
		where,
		orderBy: {
			created_at: 'desc'
		},
		take: 1
	});

	return { data: reviewViewLog };
};
