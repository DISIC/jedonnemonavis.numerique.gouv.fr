/**
 * Nettoyage et bornage de ce qui part au journal.
 *
 * Trois traitements, dans cet ordre : masquer les secrets, réduire le volume
 * quand la politique le demande, tronquer ce qui resterait trop gros.
 */

/**
 * Même liste que le journal d'événements du backoffice (`server/trpc.ts`), plus
 * l'en-tête d'autorisation. Un secret qui transiterait dans un corps de requête
 * ne doit jamais atterrir en clair dans une table qu'on garde des mois.
 */
const SENSITIVE_KEYS = new Set([
	'key',
	'apiKey',
	'api_key',
	'password',
	'newPassword',
	'token',
	'otp',
	'inviteToken',
	'authorization'
]);

const REDACTED = '[REDACTED]';

export const scrubSecrets = (value: unknown): unknown => {
	if (value === null || value === undefined) return value;
	if (Array.isArray(value)) return value.map(scrubSecrets);

	if (typeof value === 'object') {
		const out: Record<string, unknown> = {};

		for (const [key, nested] of Object.entries(value)) {
			out[key] = SENSITIVE_KEYS.has(key) ? REDACTED : scrubSecrets(nested);
		}

		return out;
	}

	return value;
};

/**
 * Réduit une réponse à sa forme : statut de remplissage plutôt que contenu.
 *
 * Répond à « combien d'enregistrements ont été extraits, avec quel curseur »
 * sans recopier les enregistrements eux-mêmes.
 */
export const summarise = (value: unknown): unknown => {
	if (Array.isArray(value)) return { _array_length: value.length };

	if (value && typeof value === 'object') {
		const out: Record<string, unknown> = {};

		for (const [key, nested] of Object.entries(value)) {
			if (Array.isArray(nested)) {
				out[key] = { _array_length: nested.length };
			} else if (nested && typeof nested === 'object') {
				out[key] = { _object_keys: Object.keys(nested) };
			} else {
				out[key] = nested;
			}
		}

		return out;
	}

	return value;
};

/** Au-delà, on ne stocke qu'un aperçu : le journal ne doit pas devenir l'archive. */
export const MAX_BODY_BYTES = 16 * 1024;

export const truncate = (value: unknown): unknown => {
	if (value === null || value === undefined) return value;

	let serialised: string;
	try {
		serialised = JSON.stringify(value) ?? '';
	} catch {
		return { _unserialisable: true };
	}

	if (Buffer.byteLength(serialised, 'utf-8') <= MAX_BODY_BYTES) return value;

	return {
		_truncated: true,
		_bytes: Buffer.byteLength(serialised, 'utf-8'),
		_preview: serialised.slice(0, 2000)
	};
};

/** Réponse brute → JSON exploitable, ou aperçu textuel si ce n'en est pas. */
export const parseResponse = (raw: string | null): unknown => {
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch {
		return { _raw: raw.slice(0, 2000) };
	}
};
