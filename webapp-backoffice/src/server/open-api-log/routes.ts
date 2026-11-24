import { openApiDocument } from '@/src/server/openapi';

/**
 * Résolution du chemin appelé vers son gabarit OpenAPI.
 *
 * `/demarches-numeriques/services/dn-abc-123/admins` doit être journalisé sous
 * `/demarches-numeriques/services/{external_id}/admins`, sinon impossible
 * d'agréger les appels d'une même API — ni de la plafonner.
 *
 * La table est dérivée du document OpenAPI généré par `trpc-openapi`, donc tout
 * endpoint ajouté au routeur est reconnu sans rien déclarer ici.
 *
 * Ce module importe le routeur (via `openapi.ts`) : il ne doit être utilisé que
 * depuis le handler HTTP, jamais depuis `server/trpc.ts`, sous peine de cycle.
 */

const HTTP_METHODS = new Set([
	'get',
	'post',
	'put',
	'patch',
	'delete',
	'head',
	'options'
]);

const OPEN_API_PREFIX = '/api/open-api';

type RouteMatcher = {
	method: string;
	template: string;
	regex: RegExp;
	paramCount: number;
};

/** Exporté pour être vérifiable seul : les gabarits à paramètre n'apparaissent
 *  qu'avec certains endpoints, et une erreur ici est silencieuse (route `null`). */
export const templateToRegex = (template: string): RegExp => {
	const pattern = template
		.split(/\{[^}]+\}/)
		.map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('[^/]+');

	return new RegExp(`^${pattern}$`, 'i');
};

const buildMatchers = (): RouteMatcher[] => {
	const paths = (openApiDocument.paths ?? {}) as Record<
		string,
		Record<string, unknown> | undefined
	>;

	const matchers: RouteMatcher[] = [];

	for (const [template, operations] of Object.entries(paths)) {
		if (!operations) continue;

		const paramCount = (template.match(/\{[^}]+\}/g) ?? []).length;
		const regex = templateToRegex(template);

		for (const method of Object.keys(operations)) {
			if (!HTTP_METHODS.has(method.toLowerCase())) continue;

			matchers.push({
				method: method.toUpperCase(),
				template,
				regex,
				paramCount
			});
		}
	}

	// Les gabarits sans paramètre d'abord : un chemin littéral ne doit jamais
	// être capté par un gabarit qui, lui, accepterait n'importe quel segment.
	return matchers.sort(
		(a, b) =>
			a.paramCount - b.paramCount || b.template.length - a.template.length
	);
};

let matchers: RouteMatcher[] | null = null;

const getMatchers = (): RouteMatcher[] => {
	if (!matchers) matchers = buildMatchers();
	return matchers;
};

/** `/api/open-api/services?x=1` → `/services`. */
export const toOpenApiPath = (url: string): string => {
	const withoutQuery = url.split('?')[0];

	const path = withoutQuery.startsWith(OPEN_API_PREFIX)
		? withoutQuery.slice(OPEN_API_PREFIX.length)
		: withoutQuery;

	const normalised = path.replace(/\/+$/, '');

	return normalised || '/';
};

/** Gabarit correspondant à un chemin déjà relatif à l'open API (`/avis`). */
export const resolveRoutePath = (
	method: string,
	path: string
): string | null => {
	const verb = method.toUpperCase();

	const match = getMatchers().find(
		candidate => candidate.method === verb && candidate.regex.test(path)
	);

	return match?.template ?? null;
};

/** Gabarit correspondant, ou `null` si la route est inconnue (404). */
export const resolveRoute = (method: string, url: string): string | null =>
	resolveRoutePath(method, toOpenApiPath(url));

const normalizePath = (path: string): string =>
	`/${path.replace(/^\/|\/$/g, '')}`;

/**
 * Chemin tel que trpc-openapi le route : segments du catch-all `[...trpc]`,
 * `normalizePath`, analyse par `URL`, puis `normalizePath` à nouveau
 * (adapters/next et adapters/node-http/core).
 */
export const toRoutedPath = (
	segments: string | string[] | undefined
): string | null => {
	if (segments === undefined) return null;

	const joined = Array.isArray(segments) ? segments.join('/') : segments;

	try {
		const url = new URL(`http://127.0.0.1${normalizePath(joined)}`);
		return normalizePath(url.pathname);
	} catch {
		return null;
	}
};
