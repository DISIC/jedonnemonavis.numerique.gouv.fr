import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getDomainListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	sort: z.string().optional(),
	search: z.string().optional()
});

export const getDomainListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getDomainListInputSchema>;
}) => {
	const { numberPerPage, page, sort, search } = input;

	let orderBy: Prisma.WhiteListedDomainOrderByWithAggregationInput[] = [
		{ domain: 'asc' }
	];

	const where: Prisma.WhiteListedDomainWhereInput = search
		? { domain: { contains: search.split(' ').join('&') } }
		: {};

	if (sort) {
		const values = sort.split(':');
		if (values.length === 2) {
			if (values[0].includes('.')) {
				const subValues = values[0].split('.');
				if (subValues.length === 2) {
					orderBy = [{ [subValues[0]]: { [subValues[1]]: values[1] } }];
				}
			} else {
				orderBy = [{ [values[0]]: values[1] }];
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
};
