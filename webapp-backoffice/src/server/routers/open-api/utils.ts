import type { Context } from '@/src/server/trpc';

export const LEGACY_FORM_IDS: readonly number[] = [1, 2];

/**
 * Exposition de `GET /avis`.
 *
 * Fermé par défaut, et volontairement : en l'absence de la variable
 * `OPEN_API_AVIS_ENABLED`, ou si elle vaut autre chose que `1`, l'endpoint est
 * inaccessible. Un environnement où l'on aurait oublié de la positionner reste
 * donc fermé, jamais ouvert.
 *
 * Le drapeau est lu à trois endroits, qui se recouvrent :
 *   - le `enabled` du `.meta` openapi, qui retire à la fois la route REST et son
 *     entrée dans le document OpenAPI publié ;
 *   - le resolver lui-même, parce que le routeur `openAPI` est monté dans
 *     `appRouter` et que la procédure resterait sinon joignable par
 *     `/api/trpc/openAPI.reviewsList` avec une clé valide ;
 *   - la page de documentation publique, qui n'affiche l'endpoint que s'il est
 *     présent dans le document.
 *
 * Attention : le `.meta` est évalué au chargement du module. Changer la variable
 * demande donc un redémarrage de l'application, pas un simple rechargement.
 */
export const isAvisApiEnabled = (): boolean =>
	process.env.OPEN_API_AVIS_ENABLED === '1';

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

export type ReviewCursor = { ts: string; id: number };

export const encodeCursor = (cursor: ReviewCursor): string =>
	Buffer.from(JSON.stringify(cursor), 'utf-8').toString('base64url');

export const decodeCursor = (raw: string): ReviewCursor | null => {
	try {
		const parsed = JSON.parse(
			Buffer.from(raw, 'base64url').toString('utf-8')
		) as unknown;
		if (
			typeof parsed !== 'object' ||
			parsed === null ||
			typeof (parsed as ReviewCursor).ts !== 'string' ||
			typeof (parsed as ReviewCursor).id !== 'number' ||
			Number.isNaN(Date.parse((parsed as ReviewCursor).ts))
		) {
			return null;
		}
		return parsed as ReviewCursor;
	} catch {
		return null;
	}
};
