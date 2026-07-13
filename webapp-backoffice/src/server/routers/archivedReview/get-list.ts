import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getArchivedReviewListInputSchema = z.object({
	product_id: z.number(),
	form_id: z.number(),
	numberPerPage: z.number().default(20),
	page: z.number().default(1)
});

export const getArchivedReviewListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getArchivedReviewListInputSchema>;
}) => {
	const { product_id, form_id, numberPerPage, page } = input;

	const where = { product_id, form_id };

	const [data, count] = await Promise.all([
		ctx.prisma.archivedReview.findMany({
			where,
			orderBy: { archived_at: 'desc' },
			take: numberPerPage,
			skip: (page - 1) * numberPerPage
		}),
		ctx.prisma.archivedReview.count({ where })
	]);

	return {
		data,
		metadata: { count }
	};
};
