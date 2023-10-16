import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';

export const whitelistRouter = router({
	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				sort: z.string().optional(),
				search: z.string().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, sort, search } = input;

			let orderBy: Prisma.WhiteListedDomainOrderByWithAggregationInput[] = [
				{
					domain: 'asc'
				}
			];

			let where: Prisma.WhiteListedDomainWhereInput = {
				domain: {
					contains: search || ''
				}
			};

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

			const entities = await ctx.prisma.whiteListedDomain.findMany({
				orderBy,
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage
			});

			const count = await ctx.prisma.whiteListedDomain.count({ where });

			return { data: entities, metadata: { count } };
		})
});
