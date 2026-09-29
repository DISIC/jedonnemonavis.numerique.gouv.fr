import type { IncomingHttpHeaders } from 'http';

/**
 * Résout l'IP cliente à partir des en-têtes de proxy.
 *
 * Chaque hop *ajoute* son entrée en fin de liste : seule la dernière valeur a
 * été écrite par un proxy de confiance, tout ce qui précède peut avoir été
 * fourni par le client. Prendre la première entrée revient à faire confiance à
 * une valeur arbitraire.
 */
export const getClientIp = (req: {
	headers: IncomingHttpHeaders;
	socket?: { remoteAddress?: string };
}): string => {
	const header = (req.headers['x-client-ip'] ||
		req.headers['x-forwarded-for']) as string | string[] | undefined;

	const raw = Array.isArray(header) ? header.join(',') : header;

	const hops = (raw || '')
		.split(',')
		.map(hop => hop.trim())
		.filter(Boolean);

	return hops[hops.length - 1] || req.socket?.remoteAddress || 'unknown';
};
