import type { Context } from '@/src/server/trpc';

/**
 * Returns the active facet referential for the UI: code → label resolution, the correction
 * editor and the facet filters. Flat list of facets (objet / thematique_site) with `product_id`
 * (null = global, typically the site themes) so the client can scope objects per product.
 * Polarity is a fixed enum (positif / negatif), not stored here.
 */
export const getCatalogueQuery = async ({ ctx }: { ctx: Context }) => {
	const facets = await ctx.prisma.classificationFacet.findMany({
		where: { active: true },
		orderBy: [{ axis: 'asc' }, { product_id: 'asc' }, { position: 'asc' }],
		select: {
			id: true,
			axis: true,
			code: true,
			label: true,
			description: true,
			product_id: true
		}
	});

	return { data: facets };
};
