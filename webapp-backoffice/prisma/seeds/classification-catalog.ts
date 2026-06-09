import type { PrismaClient } from '@prisma/client';

/**
 * Classification catalogue — EXAMPLE v1 (placeholder).
 *
 * ⚠️ This is a first-draft, illustrative tree so the classification pipeline can be
 * exercised end-to-end. JDMA will replace it with the real, business-defined catalogue.
 *
 * Shape: a 2-level hierarchy — `thème` (level 1) → `problématique` (level 2). Every
 * verbatim is classified to a LEVEL-2 `code`, including the catch-all
 * `autre_inclassable`, so the data model stays uniform (one code per review).
 *
 * The "Autre" theme is deliberate: it collects verbatims that fit none of the known
 * problématiques. That bucket is what a later, unsupervised study (clustering on
 * embeddings) will mine to *discover* candidate new categories, which a human then
 * names and promotes into this catalogue.
 *
 * Conventions:
 * - `code` is the STABLE identifier. It is what the LLM is asked to return, what we
 *   store on ReviewClassification, and what we denormalise into Elasticsearch. Never
 *   recycle a code for a different meaning — change the `label` instead.
 * - `description` is an optional hint that helps the LLM disambiguate; it is not
 *   necessarily shown to end users.
 */

export type CatalogChild = {
	code: string;
	label: string;
	description?: string;
};

export type CatalogTheme = {
	code: string;
	label: string;
	description?: string;
	children: CatalogChild[];
};

export const CLASSIFICATION_CATALOG_V1: CatalogTheme[] = [
	{
		code: 'acces_authentification',
		label: 'Accès et authentification',
		description:
			"Tout ce qui concerne la connexion, l'identité numérique et la création de compte.",
		children: [
			{
				code: 'auth_franceconnect',
				label: 'FranceConnect / ProConnect ne fonctionne pas',
				description:
					"Échec, blocage ou erreur lors de l'utilisation d'un fournisseur d'identité (FranceConnect, ProConnect, etc.)."
			},
			{
				code: 'auth_identifiants',
				label: 'Identifiants ou mot de passe',
				description:
					'Mot de passe oublié, réinitialisation impossible, identifiants refusés.'
			},
			{
				code: 'auth_creation_compte',
				label: 'Création de compte',
				description:
					"Difficulté à créer un compte ou à activer un compte nouvellement créé."
			}
		]
	},
	{
		code: 'fonctionnement_technique',
		label: 'Fonctionnement technique',
		description: 'Bugs, erreurs, lenteurs et indisponibilités du service.',
		children: [
			{
				code: 'tech_bug_erreur',
				label: 'Bug ou message d’erreur',
				description:
					"Comportement anormal, page d'erreur, fonctionnalité cassée."
			},
			{
				code: 'tech_lenteur',
				label: 'Lenteur ou performance',
				description: 'Temps de chargement excessifs, service qui rame.'
			},
			{
				code: 'tech_indisponibilite',
				label: 'Indisponibilité ou panne',
				description: 'Service inaccessible, maintenance, panne totale.'
			}
		]
	},
	{
		code: 'clarte_comprehension',
		label: 'Clarté et compréhension',
		description:
			"Compréhension des informations, des consignes et du vocabulaire.",
		children: [
			{
				code: 'clarte_instructions',
				label: 'Informations ou consignes peu claires',
				description:
					"L'usager ne comprend pas quoi faire, instructions ambiguës ou manquantes."
			},
			{
				code: 'clarte_jargon',
				label: 'Vocabulaire administratif complexe',
				description: 'Termes administratifs ou techniques peu accessibles.'
			}
		]
	},
	{
		code: 'parcours_ergonomie',
		label: 'Parcours et ergonomie',
		description: "Navigation, structure du formulaire et usage sur mobile.",
		children: [
			{
				code: 'ux_navigation',
				label: 'Navigation difficile',
				description: "Difficulté à trouver une page, à revenir en arrière, à se repérer."
			},
			{
				code: 'ux_formulaire_complexe',
				label: 'Formulaire trop long ou complexe',
				description: 'Trop de champs, étapes répétitives, saisie fastidieuse.'
			},
			{
				code: 'ux_mobile',
				label: 'Problème sur mobile',
				description: "Affichage ou usage dégradé sur smartphone / tablette."
			}
		]
	},
	{
		code: 'pieces_justificatives',
		label: 'Pièces justificatives et documents',
		description: 'Téléversement et exigences relatives aux documents demandés.',
		children: [
			{
				code: 'documents_televersement',
				label: 'Téléversement de documents',
				description: "Échec d'envoi de fichier, format refusé, taille limite."
			},
			{
				code: 'documents_exigences',
				label: 'Justificatifs demandés inadaptés',
				description:
					'Documents jugés excessifs, redondants ou difficiles à obtenir.'
			}
		]
	},
	{
		code: 'accompagnement_support',
		label: 'Accompagnement et support',
		description: "Aide, contact et délais de traitement.",
		children: [
			{
				code: 'support_manque_aide',
				label: "Manque d'aide ou de contact",
				description: "Pas d'assistance, pas de moyen de contacter quelqu'un."
			},
			{
				code: 'support_delai',
				label: 'Délai de réponse ou de traitement',
				description: 'Attente jugée trop longue pour une réponse ou un traitement.'
			}
		]
	},
	{
		code: 'satisfaction_generale',
		label: 'Satisfaction générale',
		description: 'Retours positifs sur le service.',
		children: [
			{
				code: 'satisfaction_positif',
				label: 'Retour positif',
				description: 'Avis globalement satisfait, remerciements, compliments.'
			},
			{
				code: 'satisfaction_simple_rapide',
				label: 'Démarche simple et rapide',
				description: "L'usager souligne la simplicité ou la rapidité de la démarche."
			}
		]
	},
	{
		code: 'autre',
		label: 'Autre',
		description:
			"Réservoir pour les verbatims qui n'entrent dans aucune problématique connue. " +
			"Sert de matière première à l'étude de découverte de nouvelles catégories.",
		children: [
			{
				code: 'autre_inclassable',
				label: 'Autre / inclassable',
				description:
					"Le verbatim ne correspond à aucune des problématiques du catalogue, " +
					'ou est trop court / ambigu pour être classé.'
			}
		]
	}
];

export type SeedCatalogResult = {
	themes: number;
	problematiques: number;
};

/**
 * Idempotent seed of the classification catalogue. Upserts by `code`, so it is safe to
 * run repeatedly and across environments (it updates labels/descriptions/positions in
 * place without creating duplicates). Existing categories not present in the catalogue
 * are left untouched (use the `active` flag to retire a category rather than deleting it).
 */
export async function seedClassificationCatalog(
	prisma: PrismaClient
): Promise<SeedCatalogResult> {
	let themes = 0;
	let problematiques = 0;

	for (let themeIndex = 0; themeIndex < CLASSIFICATION_CATALOG_V1.length; themeIndex++) {
		const theme = CLASSIFICATION_CATALOG_V1[themeIndex];

		const parent = await prisma.classificationCategory.upsert({
			where: { code: theme.code },
			update: {
				label: theme.label,
				description: theme.description ?? null,
				level: 1,
				active: true,
				position: themeIndex
			},
			create: {
				code: theme.code,
				label: theme.label,
				description: theme.description ?? null,
				level: 1,
				position: themeIndex
			}
		});
		themes++;

		for (let childIndex = 0; childIndex < theme.children.length; childIndex++) {
			const child = theme.children[childIndex];
			await prisma.classificationCategory.upsert({
				where: { code: child.code },
				update: {
					label: child.label,
					description: child.description ?? null,
					level: 2,
					parent_id: parent.id,
					active: true,
					position: childIndex
				},
				create: {
					code: child.code,
					label: child.label,
					description: child.description ?? null,
					level: 2,
					parent_id: parent.id,
					position: childIndex
				}
			});
			problematiques++;
		}
	}

	return { themes, problematiques };
}
