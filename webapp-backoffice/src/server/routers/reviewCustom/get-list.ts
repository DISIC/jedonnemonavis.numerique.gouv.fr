import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getReviewCustomListInputSchema = z.object({
	form_id: z.number(),
	numberPerPage: z.number(),
	page: z.number().default(1)
});

export const getReviewCustomListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getReviewCustomListInputSchema>;
}) => {
	const { form_id } = input;

	const reviews = await ctx.prisma.reviewCustom.findMany({
		where: { form_id },
		include: { answers: true }
	});

	const countReviews = await ctx.prisma.reviewCustom.count({
		where: { form_id }
	});

	return { data: reviews, metadata: { reviewsCount: countReviews } };
};
