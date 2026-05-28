import type { Context } from '@/src/server/trpc';
import {
	buildAccessibleProductsWhere,
	hasActiveSubscriptionForms,
	mapProductsToGroups,
	productSubscriptionSelect
} from './subscription-groups';

export const getActiveSubscriptionGroupsQuery = async ({
	ctx
}: {
	ctx: Context;
}) => {
	const contextUser = ctx.session!.user;
	const userId = parseInt(contextUser.id);

	const products = await ctx.prisma.product.findMany({
		where: {
			...buildAccessibleProductsWhere(contextUser),
			forms: hasActiveSubscriptionForms(userId)
		},
		select: productSubscriptionSelect(userId)
	});

	return { data: mapProductsToGroups(products) };
};
