/**
 * Politique des open API, route par route : ce qu'on journalise, et ce qu'on
 * tolère comme débit.
 *
 * Les deux vivent dans la même table pour qu'une entrée décrive un endpoint en
 * entier. Voir `docs/open-api-protection.md`.
 *
 * ── Journalisation ───────────────────────────────────────────────────────────
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

export type RateLimit = {
	/** Nombre d'appels tolérés sur la fenêtre, pour un couple (clé, route). */
	max: number;
	windowMs: number;
};

export type EndpointPolicy = {
	/** Corps de la requête (POST) ou paramètres de query (GET). */
	requestBody: boolean;
	responseBody: ResponseCapture;
	/** Appliqué par `scripts/purge-api-logs.ts`. */
	retentionDays: number;
	/**
	 * Plafond par clé et par route. `null` = aucun plafond.
	 *
	 * Volontairement dans la même table que la politique de journalisation :
	 * une entrée = tout ce qu'on sait d'un endpoint. Deux tables indexées à
	 * l'identique finiraient par diverger, avec une route déclarée dans l'une
	 * et oubliée dans l'autre.
	 */
	rateLimit: RateLimit | null;
};

/**
 * Appliquée à toute route non listée ci-dessous, aux 404, et aux lignes
 * antérieures à ce journal — celles-ci n'ayant pas de `route`, elles retombent
 * ici et seront donc purgées au-delà de cette durée.
 *
 * Pas de plafond par défaut : un endpoint non déclaré est journalisé mais pas
 * restreint. Poser une limite au jugé sur une route qu'on n'a pas regardée
 * ferait plus de dégâts que d'absence de limite.
 */
export const DEFAULT_POLICY: EndpointPolicy = {
	requestBody: true,
	responseBody: 'none',
	retentionDays: 180,
	rateLimit: null
};

/**
 * Clés au format `MÉTHODE /chemin/templaté`, tel que résolu par `routes.ts`.
 *
 * Les entrées marquées « PR » concernent des routes qui n'existent pas encore
 * sur cette branche : elles sont posées d'avance pour que la fusion des PR
 * ouvertes n'ait rien à modifier ici. Une entrée sans route correspondante est
 * inerte.
 */
const MINUTE = 60_000;

export const LOG_POLICIES: Record<string, EndpointPolicy> = {
	// ── Mutations : traçabilité maximale, plafond serré ──────────────────────
	// Opérations d'administration, rares par nature : un partenaire qui en
	// enchaîne des dizaines par minute a un problème, ou n'est pas le partenaire.
	'POST /setTop250': {
		requestBody: true,
		responseBody: 'full',
		retentionDays: 365,
		rateLimit: { max: 5, windowMs: MINUTE }
	},
	'POST /triggerMails': {
		requestBody: true,
		responseBody: 'full',
		retentionDays: 365,
		rateLimit: { max: 5, windowMs: MINUTE }
	},
	// PR #559 — provisioning Démarches Numériques. Crée services, formulaires et
	// droits d'accès à partir d'un appel partenaire : le cas le plus sensible.
	// Appelé à la création d'une démarche, donc au rythme des démarches créées.
	'POST /demarches-numeriques/services': {
		requestBody: true,
		responseBody: 'full',
		retentionDays: 365,
		rateLimit: { max: 30, windowMs: MINUTE }
	},
	'POST /demarches-numeriques/services/{external_id}/admins': {
		requestBody: true,
		responseBody: 'full',
		retentionDays: 365,
		rateLimit: { max: 30, windowMs: MINUTE }
	},

	// ── Lectures : résumé seulement ─────────────────────────────────────────
	'GET /services': {
		requestBody: true,
		responseBody: 'summary',
		retentionDays: 180,
		rateLimit: { max: 60, windowMs: MINUTE }
	},
	// Requête lourde côté Elasticsearch : le plafond protège le cluster autant
	// que l'API.
	'POST /statistiques': {
		requestBody: true,
		responseBody: 'summary',
		retentionDays: 180,
		rateLimit: { max: 30, windowMs: MINUTE }
	},
	// PR #560 — extraction des avis et verbatims. Volumineux et directement
	// personnel : on garde les filtres demandés, jamais le contenu renvoyé.
	// Plafond plus large : un partenaire enchaîne légitimement les pages.
	'GET /avis': {
		requestBody: true,
		responseBody: 'summary',
		retentionDays: 180,
		rateLimit: { max: 60, windowMs: MINUTE }
	},

	// ── Sonde de disponibilité ──────────────────────────────────────────────
	// Publique et appelée en boucle par la supervision : on garde la trace de
	// passage, rien de plus, on la purge vite, et surtout on ne la plafonne
	// pas — la supervision se ferait couper.
	'GET /health': {
		requestBody: false,
		responseBody: 'none',
		retentionDays: 30,
		rateLimit: null
	}
};

/**
 * Garde contre les tentatives d'authentification répétées.
 *
 * Globale, pas par route : c'est une propriété de l'appelant, pas de l'endpoint.
 *
 * Ne compte que les **401**. Un 404 est un scanner qui tape des chemins au
 * hasard, pas quelqu'un qui essaie de deviner une clé — le confondre avec une
 * attaque reviendrait à bannir des robots d'indexation.
 *
 * À garder en tête sur la portée réelle : deviner une clé de 44 caractères
 * aléatoires par force brute n'arrivera pas. Cette garde sert à faire taire les
 * scanners et surtout à donner le signal qu'on nous cherche.
 */
export const AUTH_GUARD = {
	/** 401 tolérés sur la fenêtre avant bannissement. */
	maxFailures: 10,
	windowMs: 10 * MINUTE,
	/**
	 * Durée du bannissement, par récidive : 15 min, puis 1 h, puis 24 h.
	 *
	 * Progressif et court au début, parce que les partenaires publics sortent
	 * souvent derrière une IP d'égressage unique de ministère : bannir sec, c'est
	 * couper tout le monde pour un agent qui s'est trompé de clé.
	 */
	banMinutes: [15, 60, 1440],
	/** Mémoire des récidives, pour l'escalade. */
	strikeTtlMs: 7 * 24 * 60 * MINUTE,
	/** IP jamais bannies, sur le modèle de `LIMITER_ALLOWED_IPS` côté webapp-form. */
	exemptIps: (process.env.OPEN_API_EXEMPT_IPS || '')
		.split(',')
		.map(ip => ip.trim())
		.filter(Boolean)
};

/**
 * Mode observation.
 *
 * Tant qu'un drapeau est à `0`, le mécanisme compte, marque `would_block` dans
 * la ligne d'audit, et **laisse passer**. C'est là que sert le journal : quelques
 * semaines de trafic réel, on regarde qui aurait été bloqué et à quel volume, on
 * ajuste, et seulement ensuite on applique.
 *
 * Deux drapeaux distincts : le quota est peu risqué et se répare seul, le
 * bannissement peut couper un ministère. Ils ne méritent pas la même prudence.
 */
export const QUOTA_ENFORCED = process.env.OPEN_API_QUOTA_ENFORCE === '1';
export const BAN_ENFORCED = process.env.OPEN_API_BAN_ENFORCE === '1';

export const getPolicy = (
	method: string,
	route: string | null
): EndpointPolicy => {
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
