import { Client as ElkClient } from '@elastic/elasticsearch';
import fs from 'fs';
import path from 'path';

/**
 * Elasticsearch client singleton for use OUTSIDE the tRPC context (workers, scripts).
 * Mirrors the client built in `src/server/trpc.ts`: node + basic auth from env, TLS using
 * the CA cert at ./certs/ca/ca.crt when present (falls back to rejectUnauthorized:false).
 *
 * Returns null when ES_ADDON_URI is not set, so callers can degrade gracefully. The
 * classification pipeline treats the ES write as best-effort (Postgres is the source of
 * truth); a missing/unreachable ES never fails a classification job.
 */
function buildElkClient(): ElkClient | null {
	const node = process.env.ES_ADDON_URI;
	if (!node) {
		console.warn('[elk] ES_ADDON_URI not set — Elasticsearch client disabled.');
		return null;
	}

	const caCrtPath = path.resolve(process.cwd(), './certs/ca/ca.crt');
	const tlsOptions = fs.existsSync(caCrtPath)
		? { ca: fs.readFileSync(caCrtPath), rejectUnauthorized: false }
		: { rejectUnauthorized: false };

	return new ElkClient({
		node,
		auth: {
			username: process.env.ES_ADDON_USER as string,
			password: process.env.ES_ADDON_PASSWORD as string
		},
		tls: tlsOptions
	});
}

declare const globalThis: {
	elkGlobal?: ElkClient | null;
} & typeof global;

const elk =
	globalThis.elkGlobal !== undefined ? globalThis.elkGlobal : buildElkClient();

export default elk;

if (process.env.NODE_ENV !== 'production') globalThis.elkGlobal = elk;

export const JDMA_ANSWERS_INDEX = 'jdma-answers';
