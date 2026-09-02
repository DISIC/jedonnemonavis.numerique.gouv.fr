import type { NextApiResponse } from 'next';

import type { ApiLogEntry } from './context';
import { MAX_BODY_BYTES } from './scrub';

/**
 * Enregistre statut et corps de la réponse au moment où elle part.
 *
 * L'adaptateur `trpc-openapi` écrit directement sur la réponse ; on ne peut donc
 * pas se contenter d'observer la valeur retournée par le handler. On enveloppe
 * `write`/`end` pour capter ce qui transite réellement — succès comme erreur,
 * y compris les 404 de route inconnue et les 400 de validation, que jamais un
 * middleware tRPC ne verrait.
 *
 * L'accumulation est bornée : au-delà du seuil, on cesse de retenir. Une
 * extraction d'avis de plusieurs mégaoctets ne doit pas transiter deux fois en
 * mémoire pour finir tronquée au flush.
 */
export const captureResponse = (
	res: NextApiResponse,
	entry: ApiLogEntry
): NextApiResponse => {
	const chunks: Buffer[] = [];
	let captured = 0;
	let overflowed = false;

	const remember = (chunk: unknown) => {
		if (!chunk || typeof chunk === 'function' || captured >= MAX_BODY_BYTES) {
			if (chunk && typeof chunk !== 'function') overflowed = true;
			return;
		}

		try {
			const buffer = Buffer.isBuffer(chunk)
				? chunk
				: Buffer.from(String(chunk), 'utf-8');

			chunks.push(buffer);
			captured += buffer.length;
		} catch {
			// Un chunk illisible ne doit pas empêcher la réponse de partir.
		}
	};

	const originalWrite = res.write.bind(res);
	const originalEnd = res.end.bind(res);

	res.write = ((chunk: unknown, ...args: unknown[]) => {
		remember(chunk);
		return (originalWrite as (...a: unknown[]) => boolean)(chunk, ...args);
	}) as typeof res.write;

	res.end = ((chunk: unknown, ...args: unknown[]) => {
		remember(chunk);

		entry.status_code = res.statusCode;
		entry.raw_response = Buffer.concat(chunks)
			.toString('utf-8')
			.slice(0, MAX_BODY_BYTES);

		if (overflowed) entry.raw_response += '…';

		return (originalEnd as (...a: unknown[]) => NextApiResponse)(
			chunk,
			...args
		);
	}) as typeof res.end;

	return res;
};
