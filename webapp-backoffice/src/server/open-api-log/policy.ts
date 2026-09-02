/**
 * Ce qu'on journalise, route par route.
 *
 * Deux raisons de ne pas tout stocker partout :
 *
 * 1. **Données personnelles.** Le corps de `POST /demarches-numeriques/services`
 *    contient des adresses e-mail d'agents ; la réponse de `GET /avis` contient
 *    des verbatims citoyens. Recopier ça intégralement dans un journal, c'est
 *    créer un second traitement, moins protégé que l'original.
 * 2. **Volumétrie.** Une lecture paginée d'avis peut peser plusieurs mégaoctets.
 *    Multiplié par le nombre d'appels, le journal deviendrait plus lourd que la
 *    base qu'il observe.
 *
 * D'où l'arbitrage : **corps complets sur les mutations** (peu nombreuses, peu
 * volumineuses, et ce sont elles qui font des dégâts — c'est là qu'il faut
 * pouvoir rejouer exactement ce qui a été demandé et ce qui a été répondu), et
 * **résumé sur les lectures** (statut, nombre d'enregistrements, curseur), ce
 * qui suffit à répondre à « qui a extrait quoi, quand, en quelle quantité ».
 *
 * Les réponses d'erreur (>= 400) sont toujours conservées en entier, quelle que
 * soit la politique : elles sont courtes et c'est tout leur intérêt.
 */
export type ResponseCapture = 'none' | 'summary' | 'full';

export type LogPolicy = {
	/** Corps de la requête (POST) ou paramètres de query (GET). */
	requestBody: boolean;
	responseBody: ResponseCapture;
	/** Appliqué par `scripts/purge-api-logs.ts`. */
	retentionDays: number;
};

/**
 * Appliquée à toute route non listée ci-dessous, aux 404, et aux lignes
 * antérieures à ce journal — celles-ci n'ayant pas de `route`, elles retombent
 * ici et seront donc purgées au-delà de cette durée.
 */
export const DEFAULT_POLICY: LogPolicy = {
	requestBody: true,
	responseBody: 'none',
	retentionDays: 180
};

/**
 * Clés au format `MÉTHODE /chemin/templaté`, tel que résolu par `routes.ts`.
 *
 * Les entrées marquées « PR » concernent des routes qui n'existent pas encore
 * sur cette branche : elles sont posées d'avance pour que la fusion des PR
 * ouvertes n'ait rien à modifier ici. Une entrée sans route correspondante est
 * inerte.
 */
export const LOG_POLICIES: Record<string, LogPolicy> = {
	// ── Mutations : traçabilité maximale ────────────────────────────────────
	'POST /setTop250': {
		requestBody: true,
		responseBody: 'full',
		retentionDays: 365
	},
	'POST /triggerMails': {
		requestBody: true,
		responseBody: 'full',
		retentionDays: 365
	},
	// PR #559 — provisioning Démarches Numériques. Crée services, formulaires et
	// droits d'accès à partir d'un appel partenaire : le cas le plus sensible.
	'POST /demarches-numeriques/services': {
		requestBody: true,
		responseBody: 'full',
		retentionDays: 365
	},
	'POST /demarches-numeriques/services/{external_id}/admins': {
		requestBody: true,
		responseBody: 'full',
		retentionDays: 365
	},

	// ── Lectures : résumé seulement ─────────────────────────────────────────
	'GET /services': {
		requestBody: true,
		responseBody: 'summary',
		retentionDays: 180
	},
	'POST /statistiques': {
		requestBody: true,
		responseBody: 'summary',
		retentionDays: 180
	},
	// PR #560 — extraction des avis et verbatims. Volumineux et directement
	// personnel : on garde les filtres demandés, jamais le contenu renvoyé.
	'GET /avis': {
		requestBody: true,
		responseBody: 'summary',
		retentionDays: 180
	},

	// ── Sonde de disponibilité ──────────────────────────────────────────────
	// Publique et appelée en boucle par la supervision : on garde la trace de
	// passage, rien de plus, et on la purge vite.
	'GET /health': {
		requestBody: false,
		responseBody: 'none',
		retentionDays: 30
	}
};

export const getPolicy = (method: string, route: string | null): LogPolicy => {
	if (!route) return DEFAULT_POLICY;

	return LOG_POLICIES[`${method.toUpperCase()} ${route}`] ?? DEFAULT_POLICY;
};

/**
 * Rétention à appliquer, couple (méthode, route) par couple (méthode, route).
 *
 * La purge balaie ces entrées puis traite le reste avec `DEFAULT_POLICY`, ce qui
 * couvre aussi les lignes historiques dont la route est inconnue.
 */
export const retentionBuckets = (): {
	method: string;
	route: string;
	days: number;
}[] =>
	Object.entries(LOG_POLICIES).map(([key, policy]) => {
		const separator = key.indexOf(' ');

		return {
			method: key.slice(0, separator),
			route: key.slice(separator + 1),
			days: policy.retentionDays
		};
	});
