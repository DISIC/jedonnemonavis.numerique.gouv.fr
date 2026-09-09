import type { Prisma } from '@prisma/client';

import prisma from '@/src/utils/db';

import type { ApiLogEntry } from './context';
import { recordAuthFailure } from './limits';
import { getPolicy } from './policy';
import { parseResponse, scrubSecrets, summarise, truncate } from './scrub';

const asJson = (value: unknown): Prisma.InputJsonValue | undefined =>
	value === undefined || value === null
		? undefined
		: (value as Prisma.InputJsonValue);

/** Retire un éventuel secret passé en query, même si aucune de nos routes n'en attend. */
const sanitiseUrl = (url: string): string =>
	url.replace(/([?&](?:key|api_key|apiKey|token|otp)=)[^&]*/gi, '$1[REDACTED]');

const errorMessageFrom = (response: unknown): string | null => {
	if (!response || typeof response !== 'object') return null;

	const message = (response as { message?: unknown }).message;

	return typeof message === 'string' ? message.slice(0, 500) : null;
};

/**
 * Écrit la ligne d'audit.
 *
 * Ne rejette jamais : une panne du journal ne doit pas transformer un appel
 * réussi en erreur pour l'appelant. En contrepartie, un échec est bruyant dans
 * les logs applicatifs — un journal d'audit muet qui perd des lignes en silence
 * ne vaut rien.
 */
export const flushApiLog = async (entry: ApiLogEntry): Promise<void> => {
	try {
		const policy = getPolicy(entry.method, entry.route);
		const response = parseResponse(entry.raw_response);
		const failed = (entry.status_code ?? 0) >= 400;

		// Les réponses d'erreur sont toujours conservées : courtes, et c'est
		// exactement ce qu'on vient chercher en cas d'incident.
		const keepResponse = failed || policy.responseBody === 'full';

		const responseBody = keepResponse
			? truncate(scrubSecrets(response))
			: policy.responseBody === 'summary'
			? summarise(response)
			: undefined;

		await prisma.apiKeyLog.create({
			data: {
				apikey_id: entry.apikey_id,
				key_hash: entry.key_hash,
				user_id: entry.user_id,
				ip: entry.ip,
				user_agent: entry.user_agent?.slice(0, 500) ?? null,
				method: entry.method,
				route: entry.route,
				url: sanitiseUrl(entry.url),
				request_body: policy.requestBody
					? asJson(truncate(scrubSecrets(entry.request_body)))
					: undefined,
				status_code: entry.status_code,
				response_body: asJson(responseBody),
				error_message:
					entry.error_message ?? (failed ? errorMessageFrom(response) : null),
				duration_ms: Date.now() - entry.started_at,
				would_block: entry.would_block,
				block_reason: entry.block_reason
			}
		});

		// Le compteur d'échecs est alimenté ici, au seul endroit qui constate déjà
		// l'issue de l'appel : pas de second point d'observation à maintenir, donc
		// aucun risque que le journal et le compteur divergent.
		//
		// Trois conditions, et la troisième est la moins évidente :
		//
		// - un 401, parce qu'un 404 est un scanner qui essaie des chemins, pas des
		//   clés ;
		// - pas déjà rejeté, sinon un appel bloqué repartirait un tour ;
		// - **aucune clé résolue**. Un 401 peut aussi venir d'une clé parfaitement
		//   valide à qui l'endpoint est refusé — `assertPartnerKey` répond
		//   UNAUTHORIZED à une clé non partenaire. Sans cette condition, un
		//   partenaire légitime qui se trompe d'endpoint dix fois se ferait bannir
		//   son IP. C'est l'authentification qui échoue qu'on compte, pas
		//   l'autorisation.
		if (
			entry.status_code === 401 &&
			entry.block_reason === null &&
			entry.apikey_id === null
		) {
			const ban = await recordAuthFailure(entry.ip);

			if (ban) {
				console.warn(
					`[open-api-limits] ${entry.ip} bannie ${ban.minutes} min ` +
						`(récidive ${ban.strike}) après échecs d'authentification répétés`
				);
			}
		}
	} catch (error) {
		console.error(
			`[open-api-log] échec de journalisation (${entry.method} ${entry.url})`,
			error
		);
	}
};
