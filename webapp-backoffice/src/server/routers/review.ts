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
				sort: z.string().optional(),
				search: z.string().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				button_id: z.number().optional()
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
				sort,
				startDate,
				endDate,
				button_id
			} = input;

			let where: Prisma.ReviewWhereInput = {};

			if (product_id) {
				where.product_id = product_id;
			}

			if (button_id) {
				where.button_id = button_id;
			}

			if (startDate && endDate) {
				const endDateAtNight = new Date(endDate)
				endDateAtNight.setHours(23)
				endDateAtNight.setMinutes(59)
				endDateAtNight.setSeconds(59)
				where.created_at = {
					gte: new Date(startDate),
					lte: new Date(endDateAtNight)
				};
			}

			if (startDate && !endDate) {
				where.created_at = {
					gte: new Date(startDate)
				};
			}

			let orderBy: Prisma.ReviewOrderByWithRelationAndSearchRelevanceInput[] = [
				{
					created_at: 'asc'
				}
			];

			if (sort) {
				const values = sort.split(':');
				if (values.length === 2) {
					if (values[0].includes('.')) {
						const subValues = values[0].split('.');
						if (subValues.length === 2) {
							orderBy = [
								{
									[subValues[0]]: {
										[subValues[1]]: values[1]
									}
								}
							];
						}
					} else {
						orderBy = [
							{
								[values[0]]: values[1]
							}
						];
					}
				}
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
				orderBy: orderBy,
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
