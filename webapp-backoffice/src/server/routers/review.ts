import { z } from 'zod';
import { router, publicProcedure } from '@/src/server/trpc';
import { ReviewPartialWithRelationsSchema } from '@/prisma/generated/zod';
import { AnswerIntention, Prisma } from '@prisma/client';
import { Condition } from '@/src/types/custom';

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

			let where: Prisma.ReviewWhereInput = {
				...(product_id && { product_id }),
				...(button_id && { button_id }),
				...(endDate && {
					created_at: {
						...(startDate && { gte: new Date(startDate) }),
						lte: (() => {
							const adjustedEndDate = new Date(endDate);
							adjustedEndDate.setHours(23, 59, 59);
							return adjustedEndDate;
						})()
					}
				}),
				...((mustHaveVerbatims || filters?.needVerbatim) && {
				  OR: [{ answers: { some: { field_code: 'verbatim' } } }]
				}),
				...(search && {
				  OR: [{
					answers: {
					  some: {
						AND: [
						  { answer_text: { contains: search, mode: 'insensitive' } },
						  { field_code: 'verbatim' }
						]
					  }
					}
				  }]
				})
			};

			let andConditions: Condition[] = [];

			if(filters) {
				const fields: { key: keyof typeof filters, field: string, isText?: boolean }[] = [
					{ key: 'comprehension', field: 'comprehension' },
					{ key: 'easy', field: 'easy' },
					{ key: 'satisfaction', field: 'satisfaction' },
					{ key: 'needOtherDifficulties', field: 'difficulties_details_verbatim', isText: false },
					{ key: 'needOtherHelp', field: 'help_details_verbatim', isText: false },
					{ key: 'difficulties', field: 'difficulties_details' },
					{ key: 'help', field: 'help_details' }
				];
				Object.keys(filters).map((key) => {
					if(filters[key as keyof typeof filters]) {
						let condition: Condition = {
							answers: {
								some: {
									field_code: fields.find(field => field.key === key)?.field as string,
									...(['comprehension', 'easy', 'satisfaction'].includes(key) && {intention: filters[key as keyof typeof filters] as AnswerIntention}),
									...(['difficulties', 'help'].includes(key) && {answer_text: filters[key as keyof typeof filters] as string})
								}
							}
						};
						andConditions.push(condition);
					}
				})
			}

			if (andConditions.length) {
			  where.AND = andConditions;
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
				}
			}

			const [entities, count] = await Promise.all([
				ctx.prisma.review.findMany({
					where,
					orderBy: orderBy,
					take: numberPerPage,
					skip: (page - 1) * numberPerPage,
					include: { answers: shouldIncludeAnswers }
				}),
				ctx.prisma.review.count({ where })
			]);

			return { data: entities, metadata: { count } };
		})
});
