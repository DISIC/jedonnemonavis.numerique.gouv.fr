import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';

export const entityRouter = router({
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
			const { numberPerPage, page, search, sort } = input;

			let where: Prisma.EntityWhereInput = {
				name: {
					contains: search || ''
				}
			};

			let orderBy: Prisma.EntityOrderByWithAggregationInput[] = [
				{
					name: 'asc'
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

			const entities = await ctx.prisma.entity.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				orderBy
			});

			const count = await ctx.prisma.entity.count({ where });

			return { data: entities, metadata: { count } };
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const { id } = input;
			const entity = await ctx.prisma.entity.findUnique({ where: { id } });
			return { data: entity };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const deletedEntity = await ctx.prisma.entity.delete({
				where: { id }
			});

			return { data: deletedEntity };
		})
});
