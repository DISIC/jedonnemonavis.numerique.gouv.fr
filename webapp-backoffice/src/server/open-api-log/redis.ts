import IORedis from 'ioredis';

/**
 * Client Redis dédié au plafonnement des open API.
 *
 * **Volontairement distinct du singleton `src/lib/redis.ts`.** Celui-ci est
 * configuré pour BullMQ avec `maxRetriesPerRequest: null`, ce qui signifie que
 * les commandes sont mises en file d'attente indéfiniment quand la connexion est
 * perdue, au lieu d'échouer. C'est ce que BullMQ exige, et c'est exactement ce
 * qu'il ne faut pas ici : une commande qui ne rejette jamais, c'est une requête
 * HTTP qui ne se termine jamais.
 *
 * D'où trois précautions :
 *
 * - `enableOfflineQueue: false` — hors ligne, la commande échoue tout de suite
 *   plutôt que de s'empiler dans une file sans limite ;
 * - `maxRetriesPerRequest: 1` — on ne s'acharne pas sur le chemin critique ;
 * - un délai maximal dur autour de chaque commande, parce qu'une socket morte
 *   qu'`ioredis` croit encore vivante ne produit ni erreur ni réponse.
 *
 * Deux connexions dans le processus, donc, et c'est une bonne chose : un client
 * de plafonnement en difficulté ne doit pas entraîner la file d'alertes avec lui.
 */

/** Au-delà, on renonce et on laisse passer. Le plafonnement n'est pas un service critique. */
const COMMAND_TIMEOUT_MS = 150;

const createClient = () =>
	new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
		enableOfflineQueue: false,
		maxRetriesPerRequest: 1,
		connectTimeout: 500,
		lazyConnect: true,
		// Sans ça, ioredis journalise une erreur par tentative de reconnexion.
		retryStrategy: times => Math.min(times * 500, 10_000)
	});

declare const globalThis: {
	openApiLimiterRedis?: ReturnType<typeof createClient>;
} & typeof global;

let warnedUnavailable = false;

const getClient = () => {
	if (!globalThis.openApiLimiterRedis) {
		const client = createClient();

		client.on('error', error => {
			// Une seule ligne par épisode : une boucle de reconnexion ne doit pas
			// noyer les logs applicatifs.
			if (!warnedUnavailable) {
				warnedUnavailable = true;
				console.warn(
					'[open-api-limits] Redis indisponible, plafonnement en retrait',
					error.message
				);
			}
		});

		client.on('ready', () => {
			warnedUnavailable = false;
		});

		client.connect().catch(() => {
			// `lazyConnect` : l'échec initial est déjà signalé par l'écouteur ci-dessus.
		});

		globalThis.openApiLimiterRedis = client;
	}

	return globalThis.openApiLimiterRedis;
};

/**
 * Exécute une commande Redis en dégradation ouverte.
 *
 * Toute erreur — connexion perdue, délai dépassé, réponse inattendue — renvoie
 * `fallback`. Une API partenaire ne doit pas s'arrêter parce que le cache est
 * éteint : on préfère laisser passer un appel de trop que couper un ministère.
 */
export const redisCommand = async <T>(
	run: (client: IORedis) => Promise<T>,
	fallback: T
): Promise<T> => {
	try {
		const client = getClient();

		if (client.status !== 'ready') return fallback;

		return await Promise.race([
			run(client),
			new Promise<T>(
				(_, reject) =>
					setTimeout(
						() => reject(new Error('timeout')),
						COMMAND_TIMEOUT_MS
					).unref?.()
			)
		]);
	} catch {
		return fallback;
	}
};

/** Utilisé par les vérifications locales pour repartir d'un état propre. */
export const redisFlushPrefix = async (prefix: string): Promise<number> =>
	redisCommand(async client => {
		const keys = await client.keys(`${prefix}*`);
		if (keys.length === 0) return 0;
		return client.del(...keys);
	}, 0);
