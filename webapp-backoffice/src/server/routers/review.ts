import { z } from 'zod';
import { router, publicProcedure } from '@/src/server/trpc';
import { ReviewPartialWithRelationsSchema } from '@/prisma/generated/zod';
import { Prisma } from '@prisma/client';

export const reviewRouter = router({
	getList: publicProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				product_id: z.number().optional(),
				shouldIncludeAnswers: z.boolean().optional().default(false),
				search: z.string().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional()
			})
		)
		.output(
			z.object({
				data: z.array(ReviewPartialWithRelationsSchema),
				metadata: z.object({
					count: z.number()
				})
			})
		)
		.query(async ({ ctx, input }) => {
			const {
				numberPerPage,
				page,
				product_id,
				shouldIncludeAnswers,
				search,
				startDate,
				endDate
			} = input;

			let where: Prisma.ReviewWhereInput = {};

			if (product_id) {
				where.product_id = product_id;
			}

			if (startDate && endDate) {
				where.created_at = {
					gte: new Date(startDate),
					lte: new Date(endDate)
				};
			}

			if (startDate && !endDate) {
				where.created_at = {
					gte: new Date(startDate)
				};
			}

			if (search) {
				where = {
					...where,
					OR: [
						{
							answers: {
								some: {
									field_label: {
										contains: search,
										mode: 'insensitive'
									}
								}
							}
						}
					]
				};
			}

			const entities = await ctx.prisma.review.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				include: {
					answers: shouldIncludeAnswers
				}
			});

			const count = await ctx.prisma.review.count({ where });

			return { data: entities, metadata: { count } };
		})
});
