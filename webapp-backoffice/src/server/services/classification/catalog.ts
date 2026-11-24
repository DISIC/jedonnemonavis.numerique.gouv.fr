import type { PrismaClient } from '@prisma/client';
import type { FacetReferential } from '@/src/lib/albert';

/**
 * Load the active facet referential for a product: product-specific facets + global ones
 * (`product_id` null — typically the site themes). Returned split by axis, in the shape the
 * Albert client expects. Reusable by the worker, the validation router and the catalogue API.
 */
export async function loadFacetReferential(
	prisma: PrismaClient,
	productId: number
): Promise<FacetReferential> {
	const facets = await prisma.classificationFacet.findMany({
		where: {
			active: true,
			OR: [{ product_id: productId }, { product_id: null }]
		},
		orderBy: [{ axis: 'asc' }, { position: 'asc' }]
	});

	const toLite = (f: (typeof facets)[number]) => ({
		code: f.code,
		label: f.label,
		description: f.description
	});

	return {
		objets: facets.filter(f => f.axis === 'objet').map(toLite),
		thematiques: facets.filter(f => f.axis === 'thematique_site').map(toLite)
	};
}
