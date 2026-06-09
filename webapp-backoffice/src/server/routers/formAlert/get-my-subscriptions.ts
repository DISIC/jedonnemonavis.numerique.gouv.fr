import type { Context } from '@/src/server/trpc';
import {
	alternativeString,
	buildSearchQuery,
	normalizeString
} from '@/src/utils/tools';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
	buildAccessibleProductsWhere,
	hasActiveSubscriptionForms,
	mapProductsToGroups,
	productSubscriptionSelect
} from './subscription-groups';

const ADMIN_CATALOG_LIMIT = 50;

export const getMySubscriptionsInputSchema = z
	.object({ search: z.string().optional() })
	.optional();

export const getMySubscriptionsQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getMySubscriptionsInputSchema>;
}) => {
	const contextUser = ctx.session!.user;
	const userId = parseInt(contextUser.id);
	const isSiteWideAdmin = contextUser.role.includes('admin');
	const search = input?.search?.trim();

	const baseWhere: Prisma.ProductWhereInput = {
		...buildAccessibleProductsWhere(contextUser),
		NOT: { forms: hasActiveSubscriptionForms(userId) }
	};

	let where = baseWhere;
	if (search) {
		const searchWithoutAccents = normalizeString(search);
		const alternativeSearchText = alternativeString(searchWithoutAccents);
		const queries = new Set<string>([buildSearchQuery(searchWithoutAccents)]);
		if (
			alternativeSearchText &&
			alternativeSearchText !== searchWithoutAccents
		) {
			queries.add(buildSearchQuery(alternativeSearchText));
		}
		const orConditions = Array.from(queries).flatMap(q => [
			{ title_formatted: { search: q } },
			{ title: { search: q } }
		]);
		where = { AND: [baseWhere, { OR: orConditions }] };
	}

	const products = await ctx.prisma.product.findMany({
		where,
		select: productSubscriptionSelect(userId),
		orderBy: { title: 'asc' },
		...(isSiteWideAdmin ? { take: ADMIN_CATALOG_LIMIT + 1 } : {})
	});

	const truncated = isSiteWideAdmin && products.length > ADMIN_CATALOG_LIMIT;
	const data = mapProductsToGroups(
		truncated ? products.slice(0, ADMIN_CATALOG_LIMIT) : products
	);

	return { data, truncated };
};
