/**
 * Constantes partagées du parcours de provisioning « Démarches Numériques » (DN).
 * Ce fichier ne dépend d'aucune brique serveur (tRPC) : il est importable depuis le
 * seed Prisma comme depuis les endpoints API.
 *
 * Voir docs/demarches-numeriques-provisioning.md.
 */

/** Valeur de `Product.source` pour un service créé via l'API DN. */
export const DN_SOURCE = 'demarches_numeriques' as const;

/** Compte de service qui porte la clé API partenaire DN. */
export const DN_SERVICE_ACCOUNT_EMAIL =
	'service-demarches-numeriques@numerique.gouv.fr';

/**
 * Organisation tampon : tous les services provisionnés depuis DN y atterrissent
 * jusqu'à réaffectation manuelle vers la vraie organisation par un admin JDMA.
 */
export const DN_TAMPON_ENTITY_NAME = 'Démarches Numériques (à réaffecter)';
export const DN_TAMPON_ENTITY_ACRONYM = 'DN';
