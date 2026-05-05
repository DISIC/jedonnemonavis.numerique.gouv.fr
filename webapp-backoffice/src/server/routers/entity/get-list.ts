import type { Context } from '@/src/server/trpc';
import { buildOrderBy } from '@/src/server/utils/order-by';
import { Prisma } from '@prisma/client';
import { normalizeString } from '@/src/utils/tools';
import { z } from 'zod';

const ENTITY_SORT_FIELDS = [
	'name',
	'acronym',
	'created_at',
	'updated_at'
] as const;

export const getEntityListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	isMine: z.boolean().optional(),
	sort: z.string().optional(),
	search: z.string().optional(),
	userCanCreateProduct: z.boolean().optional()
});

export const getEntityListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getEntityListInputSchema>;
}) => {
	const contextUser = ctx.session!.user;
	const { numberPerPage, page, search, sort, isMine, userCanCreateProduct } =
		input;

	let where: Prisma.EntityWhereInput = {};

	if (search) {
		const searchWithoutAccents = normalizeString(search);
		const searchSplitted = searchWithoutAccents.split(' ');

		if (searchSplitted.length > 1) {
			where = {
				OR: [
					{
						name_formatted: {
							search: searchSplitted.join('&'),
							mode: 'insensitive'
						}
					},
					{
						acronym: { search: searchSplitted.join('&'), mode: 'insensitive' }
					}
				]
			};
		} else {
			where = {
				OR: [
					{
						name_formatted: {
							contains: searchWithoutAccents,
							mode: 'insensitive'
						}
					},
					{ acronym: { contains: searchWithoutAccents, mode: 'insensitive' } }
				]
			};
		}
	}

	const myEntities = await ctx.prisma.entity.findMany({
		take: 10000,
		where: {
			adminEntityRights: { some: { user_email: contextUser.email } }
		}
	});

	if (isMine) {
		where.adminEntityRights = { some: { user_email: contextUser.email } };
	} else if (isMine === false) {
		where.adminEntityRights = { none: { user_email: contextUser.email } };
	}

	if (userCanCreateProduct && !contextUser.role.includes('admin')) {
		where.OR = [
			{ adminEntityRights: { some: { user_email: contextUser.email } } },
			{
				products: {
					some: {
						accessRights: { some: { user_email: contextUser.email } }
					}
				}
			}
		];
	}

	let orderBy: Prisma.EntityOrderByWithAggregationInput[] = [{ name: 'asc' }];

	const safeOrderBy = buildOrderBy(sort, ENTITY_SORT_FIELDS);
	if (safeOrderBy) {
		orderBy = [safeOrderBy as Prisma.EntityOrderByWithAggregationInput];
	}

	const entities = await ctx.prisma.entity.findMany({
		where,
		take: numberPerPage,
		skip: (page - 1) * numberPerPage,
		orderBy
	});

	const count = await ctx.prisma.entity.count({ where });

	return { data: entities, metadata: { count, myEntities } };
};
