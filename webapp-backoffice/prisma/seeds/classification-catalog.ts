import type { PrismaClient } from '@prisma/client';

/**
 * Classification referential — FACETS (v1).
 *
 * The classification model has three axes (cf. `docs/classification-integration-plan.md`):
 *   - Axe A — OBJETS: what the verbatim is about, **product-specific** (e.g. for impôts:
 *     "déclaration de revenus", "paiement", "prélèvement à la source"…). These are discovered
 *     offline by the clustering pipeline (`analysis/verbatim-clustering/`) and imported per
 *     product with a non-null `product_id`. They are NOT seeded here.
 *   - Axe B — THÉMATIQUES SITE: actionable, mostly cross-product themes (connexion, bugs,
 *     clarté…). These ARE seeded here as GLOBAL facets (`product_id = null`) so every product
 *     shares the same actionable vocabulary.
 *   - Axe C — POLARITÉ: a fixed enum (positif / negatif), stored on `ReviewClassification`,
 *     not in this referential.
 *
 * Conventions:
 * - `code` is the STABLE identifier returned by the LLM, stored on the facet rows and
 *   denormalised into Elasticsearch. Never recycle a code for a different meaning — change
 *   the `label` instead, and retire a facet with `active = false` rather than deleting it.
 * - `description` is an optional hint for the LLM / the correction UI.
 */

export type FacetSeed = {
	code: string;
	label: string;
	description?: string;
};

/**
 * Global, actionable site themes (Axe B). Shared by all products (`product_id = null`).
 */
export const THEMATIQUES_SITE: FacetSeed[] = [
	{
		code: 'auth_connexion',
		label: 'Connexion / authentification',
		description:
			"Connexion impossible, FranceConnect/ProConnect en échec, identifiants ou mot de passe refusés."
	},
	{
		code: 'compte_creation',
		label: 'Création / gestion de compte',
		description:
			"Difficulté à créer, activer ou gérer un compte (hors simple connexion)."
	},
	{
		code: 'navigation_ergonomie',
		label: 'Navigation & ergonomie',
		description:
			"Difficulté à se repérer, à trouver une page, parcours confus, formulaire trop long."
	},
	{
		code: 'clarte_infos',
		label: 'Clarté des informations / consignes',
		description:
			"Consignes ambiguës, informations manquantes, vocabulaire administratif peu accessible."
	},
	{
		code: 'documents_pj',
		label: 'Pièces justificatives / téléversement',
		description:
			"Envoi de fichiers en échec, format/taille refusés, justificatifs jugés inadaptés."
	},
	{
		code: 'bugs_lags',
		label: 'Bugs / lenteurs / indisponibilités',
		description:
			"Message d'erreur, fonctionnalité cassée, lenteurs, service inaccessible ou en panne."
	},
	{
		code: 'mobile',
		label: 'Problèmes sur mobile',
		description: "Affichage ou usage dégradé sur smartphone / tablette."
	},
	{
		code: 'accessibilite',
		label: 'Accessibilité',
		description:
			"Obstacles pour les personnes en situation de handicap (lecteur d'écran, contrastes, navigation clavier…)."
	},
	{
		code: 'support_contact',
		label: 'Accompagnement / contact / support',
		description:
			"Manque d'aide, pas de moyen de contact, assistance jugée insuffisante."
	},
	{
		code: 'delais_traitement',
		label: 'Délais de traitement / réponse',
		description:
			"Attente jugée trop longue pour une réponse, un traitement ou un remboursement."
	},
	{
		code: 'complexite_charge',
		label: 'Complexité / charge ressentie',
		description:
			"La démarche est vécue comme complexe, lourde, pénible ou décourageante, sans bug technique précis."
	},
	{
		code: 'satisfaction',
		label: 'Satisfaction générale',
		description:
			"Retour globalement positif : remerciements, démarche jugée simple ou rapide."
	}
];

export type SeedCatalogResult = {
	objets: number;
	thematiques: number;
};

/**
 * Idempotent upsert of ONE facet. Done by hand (findFirst + update/create) because Prisma
 * cannot `upsert`/`findUnique` on the `[product_id, axis, code]` composite unique when
 * `product_id` is null (global facets), which is exactly the case for the site themes.
 */
async function upsertFacet(
	prisma: PrismaClient,
	params: {
		product_id: number | null;
		axis: 'objet' | 'thematique_site';
		code: string;
		label: string;
		description?: string | null;
		position: number;
	}
): Promise<void> {
	const existing = await prisma.classificationFacet.findFirst({
		where: {
			product_id: params.product_id,
			axis: params.axis,
			code: params.code
		},
		select: { id: true }
	});

	if (existing) {
		await prisma.classificationFacet.update({
			where: { id: existing.id },
			data: {
				label: params.label,
				description: params.description ?? null,
				active: true,
				position: params.position
			}
		});
	} else {
		await prisma.classificationFacet.create({
			data: {
				product_id: params.product_id,
				axis: params.axis,
				code: params.code,
				label: params.label,
				description: params.description ?? null,
				position: params.position
			}
		});
	}
}

/**
 * Seed the GLOBAL facet referential (site themes). Safe to run repeatedly and across
 * environments; it updates labels/descriptions/positions in place without creating
 * duplicates. Product-specific objets are imported separately (per-product, non-null
 * `product_id`) from the clustering catalogs and are left untouched here.
 */
export async function seedClassificationCatalog(
	prisma: PrismaClient
): Promise<SeedCatalogResult> {
	let thematiques = 0;

	for (let i = 0; i < THEMATIQUES_SITE.length; i++) {
		const t = THEMATIQUES_SITE[i];
		await upsertFacet(prisma, {
			product_id: null,
			axis: 'thematique_site',
			code: t.code,
			label: t.label,
			description: t.description ?? null,
			position: i
		});
		thematiques++;
	}

	return { objets: 0, thematiques };
}
