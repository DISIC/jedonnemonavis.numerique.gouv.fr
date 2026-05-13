import type { Context } from '@/src/server/trpc';
import { buildOrderBy } from '@/src/server/utils/order-by';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const USER_REQUEST_SORT_FIELDS = [
	'created_at',
	'updated_at',
	'status',
	'reason',
	'mode',
	'user.email',
	'user.firstName',
	'user.lastName',
	'product.title'
] as const;

export const getUserRequestListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
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

	const safeOrderBy = buildOrderBy(sort, USER_REQUEST_SORT_FIELDS);
	if (safeOrderBy) {
		orderBy = [safeOrderBy as Prisma.UserRequestOrderByWithAggregationInput];
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
