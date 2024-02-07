import { ReviewSchema } from '@/prisma/generated/zod';
import { protectedProcedure, router } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const reviewRouter = router({
	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				product_id: z.number().optional()
			})
		)
		.output(
			z.object({
				data: z.array(ReviewSchema),
				metadata: z.object({
					count: z.number()
				})
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, product_id } = input;

			let where: Prisma.ReviewWhereInput = {};

			if (product_id) {
				where.product_id = product_id;
			}

			const entities = await ctx.prisma.review.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage
			});

			const count = await ctx.prisma.review.count({ where });

			return { data: entities, metadata: { count } };
		})
});
