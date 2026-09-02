import crypto from 'crypto';
import type { NextApiRequest } from 'next';

import { getClientIp } from '@/src/server/utils/client-ip';

/**
 * État d'un appel open API en cours de journalisation.
 *
 * Objet **mutable** attaché à la requête : le wrapper HTTP l'initialise, les
 * couches traversées (middleware de clé, endpoints) l'enrichissent au passage,
 * et il est écrit en base une fois la réponse émise.
 *
 * Ce module est volontairement sans dépendance lourde (ni Prisma, ni le routeur
 * tRPC) : il est importé depuis `server/trpc.ts`, et tout import du routeur
 * créerait un cycle.
 */
export type ApiLogEntry = {
	started_at: number;

	method: string;
	url: string;
	/** Chemin templaté, résolu par `routes.ts`. `null` si la route est inconnue (404). */
	route: string | null;

	ip: string;
	user_agent: string | null;

	key_hash: string | null;
	apikey_id: number | null;
	user_id: number | null;

	request_body: unknown;

	status_code: number | null;
	/** Réponse brute telle qu'écrite sur le socket, tronquée. Interprétée au flush. */
	raw_response: string | null;
	error_message: string | null;
};

const API_LOG = Symbol.for('jdma.openApiLog');

type RequestWithLog = NextApiRequest & { [API_LOG]?: ApiLogEntry };

/**
 * Empreinte du Bearer présenté.
 *
 * On ne stocke jamais le secret en clair : le hash suffit à corréler les appels
 * d'un même appelant, y compris quand la clé n'existe pas (tentative d'accès) ou
 * qu'elle a été supprimée depuis.
 */
export const hashBearer = (authorization?: string): string | null => {
	if (!authorization) return null;

	const [scheme, token] = authorization.split(' ');
	if (scheme !== 'Bearer' || !token) return null;

	return crypto.createHash('sha256').update(token).digest('hex');
};

export const startApiLog = (req: NextApiRequest): ApiLogEntry => {
	const entry: ApiLogEntry = {
		started_at: Date.now(),
		method: req.method || 'GET',
		url: req.url || '',
		route: null,
		ip: getClientIp(req),
		user_agent: (req.headers['user-agent'] as string) || null,
		key_hash: hashBearer(req.headers.authorization),
		apikey_id: null,
		user_id: null,
		request_body: undefined,
		status_code: null,
		raw_response: null,
		error_message: null
	};

	(req as RequestWithLog)[API_LOG] = entry;

	return entry;
};

export const getApiLog = (req: NextApiRequest): ApiLogEntry | undefined =>
	(req as RequestWithLog)[API_LOG];

/**
 * Complète le journal depuis une couche traversée.
 *
 * Sans effet si la requête n'est pas journalisée (appel tRPC interne, test
 * unitaire) : les appelants n'ont pas à savoir s'ils sont sous le wrapper.
 */
export const enrichApiLog = (
	req: NextApiRequest | undefined,
	patch: Partial<ApiLogEntry>
): void => {
	if (!req) return;

	const entry = getApiLog(req);
	if (!entry) return;

	Object.assign(entry, patch);
};
