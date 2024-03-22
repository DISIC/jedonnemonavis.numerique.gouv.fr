import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { WhiteListedDomainCreateInputSchema } from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';

export const domainRouter = router({
	getList: protectedProcedure
		.meta({ isAdmin: true })
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

			let where: Prisma.WhiteListedDomainWhereInput = search
				? {
						domain: {
							search: search.split(' ').join('&')
						}
					}
				: {};

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
		}),

	create: protectedProcedure
		.meta({ isAdmin: true })
		.input(WhiteListedDomainCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const { domain } = input;

			const existsDomain = await ctx.prisma.whiteListedDomain.findUnique({
				where: {
					domain
				}
			});

			if (existsDomain)
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Domain already exists'
				});

			const createdDomain = await ctx.prisma.whiteListedDomain.create({
				data: {
					domain
				}
			});

			return { data: createdDomain };
		}),

	delete: protectedProcedure
		.meta({ isAdmin: true })
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const deletedDomain = await ctx.prisma.whiteListedDomain.delete({
				where: {
					id
				}
			});

			return { data: deletedDomain };
		})
});
