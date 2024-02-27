import { z } from 'zod';
import { router, publicProcedure } from '@/src/server/trpc';
import { EnumAnswerIntentionNullableFilterSchema, EnumAnswerIntentionNullableWithAggregatesFilterSchema, ReviewPartialWithRelationsSchema } from '@/prisma/generated/zod';
import { AnswerIntention, Prisma } from '@prisma/client';

export const reviewRouter = router({
	getList: publicProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				product_id: z.number().optional(),
				shouldIncludeAnswers: z.boolean().optional().default(false),
				mustHaveVerbatims: z.boolean().optional().default(false),
				sort: z.string().optional(),
				search: z.string().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				button_id: z.number().optional(),
				filters: z.object({
					satisfaction: z.string().optional(),
					easy: z.string().optional(),
					comprehension: z.string().optional(),
					needVerbatim: z.boolean().optional(),
					needOtherDifficulties: z.boolean().optional(),
					needOtherHelp: z.boolean().optional(),
					difficulties: z.string().optional(),
					help: z.string().optional()
				}).optional()
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
				mustHaveVerbatims,
				search,
				sort,
				startDate,
				endDate,
				button_id,
				filters
			} = input;

			let where: Prisma.ReviewWhereInput = {};

			if (product_id) {
				where.product_id = product_id;
			}

			if (button_id) {
				where.button_id = button_id;
			}

			let andConditions = [];

			if (filters?.comprehension) {
				andConditions.push({
					answers: {
						some: {
							field_code: 'comprehension',
							intention: filters.comprehension as AnswerIntention
						}
					}
				});
			}

			if (filters?.easy) {
				andConditions.push({
					answers: {
						some: {
							field_code: 'easy',
							intention: filters.easy as AnswerIntention
						}
					}
				});
			}

			if (filters?.satisfaction) {
				andConditions.push({
					answers: {
						some: {
							field_code: 'satisfaction',
							intention: filters.satisfaction as AnswerIntention
						}
					}
				});
			}

			if (filters?.needOtherDifficulties) {
				andConditions.push({
					answers: {
						some: {
							field_code: 'difficulties_details_verbatim',
						}
					}
				});
			}

			if(filters?.needOtherHelp) {
				andConditions.push({
					answers: {
						some: {
							field_code: 'help_details_verbatim',
						}
					}
				});
			}

			if(filters?.difficulties) {
				andConditions.push({
					answers: {
						some: {
							field_code: 'difficulties_details',
							answer_text: filters.difficulties
						}
					}
				});
			}

			if(filters?.help) {
				andConditions.push({
					answers: {
						some: {
							field_code: 'help_details',
							answer_text: filters.help
						}
					}
				});
			}

			if (andConditions.length > 0) {
				where = {
					...where,
					AND: andConditions
				};
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
				console.log('sort : ', sort)
				const values = sort.split(':')
				if(sort.includes('created_at')) {
					orderBy = [
						{
							[values[0]]: values[1]
						}
					];
				} else {
					
				}
			}

			if(mustHaveVerbatims || filters?.needVerbatim) {
				where = {
					...where,
					OR: [
						{
							answers: {
								some: {field_code: 'verbatim'}
							}
							
						}
					]
				};
			}

			if (search) {
				where = {
					...where,
					OR: [
						{
							answers: {
								some: {
									AND: [
										{
											answer_text: {
												contains: search,
												mode: 'insensitive'
											}
										},
										{
											field_code: 'verbatim'
										}
									]
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
