import { NextApiRequest, NextApiResponse } from 'next';
import { createOpenApiNextHandler } from 'trpc-openapi';

import {
	banEnforced,
	captureResponse,
	flushApiLog,
	isIpBanned,
	markWouldBlock,
	resolveRoute,
	shouldLogBannedHit,
	startApiLog
} from '@/src/server/open-api-log';
import { appRouter } from '@/src/server/routers/root';
import { createContext } from '@/src/server/trpc';

/**
 * Ce que l'appelant a demandé : corps JSON pour les mutations, paramètres de
 * query pour les lectures. Le tout est masqué et borné au moment du flush.
 */
const requestPayload = (req: NextApiRequest): unknown => {
	if (
		req.body &&
		typeof req.body === 'object' &&
		Object.keys(req.body).length > 0
	) {
		return req.body;
	}

	if (typeof req.body === 'string' && req.body.length > 0) {
		try {
			return JSON.parse(req.body);
		} catch {
			return { _raw: req.body.slice(0, 2000) };
		}
	}

	// `trpc` est le paramètre attrape-tout de la route Next, pas une donnée métier.
	const { trpc, ...query } = req.query;

	return Object.keys(query).length > 0 ? query : undefined;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');

	// Le préflight ne dit rien de qui fait quoi : inutile de le journaliser.
	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		return res.end();
	}

	// Point de capture unique de toutes les open API. Tout ce qui passe par
	// `/api/open-api/*` est journalisé ici — y compris les appels rejetés, qui
	// n'atteignent jamais un endpoint et sont pourtant les plus instructifs.
	// Voir `src/server/open-api-log/`.
	const entry = startApiLog(req);
	entry.route = resolveRoute(entry.method, entry.url);
	entry.request_body = requestPayload(req);

	captureResponse(res, entry);

	// Bannissement : vérifié avant `createContext`, qui ouvrirait une session et
	// un client Elasticsearch — inutile de payer ça pour un appelant qu'on
	// s'apprête à rejeter.
	if (await isIpBanned(entry.ip)) {
		markWouldBlock(req, 'brute_force_ban');

		if (banEnforced()) {
			// Le rejet doit rester gratuit : une IP bannie qui martèle ne doit pas
			// provoquer une écriture par requête, sinon la protection devient
			// elle-même le vecteur d'abus.
			const worthLogging = shouldLogBannedHit(entry.ip);

			res
				.status(403)
				.json({ code: 'FORBIDDEN', message: 'Access temporarily blocked' });

			if (worthLogging) await flushApiLog(entry);

			return;
		}
	}

	try {
		return await createOpenApiNextHandler({
			router: appRouter,
			createContext,
			responseMeta: undefined,
			onError: undefined
		})(req, res);
	} catch (error) {
		entry.error_message =
			error instanceof Error ? error.message : String(error);
		throw error;
	} finally {
		await flushApiLog(entry);
	}
};

export default handler;
