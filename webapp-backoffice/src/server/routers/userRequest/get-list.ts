import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getUserRequestListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	// NOTE: sort is an opaque "field:direction" string parsed at runtime.
	// Dynamic field access is intentional here; type-unsafe by design.
	sort: z.string().optional(),
	displayProcessed: z.boolean()
});

export const getUserRequestListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getUserRequestListInputSchema>;
}) => {
	const { numberPerPage, page, sort, displayProcessed } = input;

	let orderBy: Prisma.UserRequestOrderByWithAggregationInput[] = [
		{
			created_at: 'asc'
		}
	];

	let where: Prisma.UserRequestWhereInput = {
		status: displayProcessed ? undefined : 'pending'
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

	const userRequests = await ctx.prisma.userRequest.findMany({
		orderBy,
		where,
		take: numberPerPage,
		skip: numberPerPage * (page - 1),
		include: {
			user: true
		}
	});

	const count = await ctx.prisma.userRequest.count({ where });

	return { data: userRequests, metadata: { count } };
};
