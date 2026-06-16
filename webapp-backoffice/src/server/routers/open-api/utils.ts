import type { Context } from '@/src/server/trpc';

export const getAuthorizedProductIds = async (
	ctx: Context
): Promise<number[]> => {
	if (ctx.api_key?.product_id) {
		return [ctx.api_key.product_id];
	}

	if (ctx.api_key?.entity_id) {
		const entity = await ctx.prisma.entity.findFirst({
			where: { id: ctx.api_key.entity_id },
			include: { products: { select: { id: true } } }
		});

		if (entity?.products) {
			return entity.products.map(p => p.id);
		}
	}

	return [];
};
