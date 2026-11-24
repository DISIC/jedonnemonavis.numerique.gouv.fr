/**
 * Minimal Albert API client (DINUM/Etalab, OpenAI-compatible).
 *
 * Albert exposes an OpenAI-compatible surface under a `/v1` base path. We only need a thin
 * wrapper around `POST /v1/chat/completions` for classification, with structured output
 * enforced via `response_format: { type: 'json_schema' }`.
 *
 * Modèle à 3 FACETTES (aligné sur le pipeline offline `analysis/verbatim-clustering`) :
 *   - AXE A — objets    : de QUOI parle l'usager (spécifique au produit) — 0..n
 *   - AXE B — thématiques site : nature de la difficulté sur l'outil — 0..n
 *   - AXE C — polarité  : positif / negatif (multi : []=neutre, [pos,neg]=mitigé)
 *   + `pourquoi` (justification citant le texte) et `confiance` (0..1).
 *
 * Config (env, backoffice only — the form app never calls Albert directly):
 *   ALBERT_API_BASE_URL  e.g. https://albert.api.etalab.gouv.fr/v1
 *   ALBERT_API_KEY       bearer token
 *   ALBERT_CHAT_MODEL    model id/alias, default "openweight-medium"
 */

const BASE_URL = process.env.ALBERT_API_BASE_URL;
const API_KEY = process.env.ALBERT_API_KEY;
const DEFAULT_MODEL = process.env.ALBERT_CHAT_MODEL || 'openweight-medium';

/**
 * Bumped whenever the prompt or the structured-output contract changes. Stored on each
 * ReviewClassification so predictions can be tied back to the exact prompt that produced them.
 */
export const CLASSIFICATION_PROMPT_VERSION = 'facets-v1';

export function isAlbertConfigured(): boolean {
	return Boolean(BASE_URL && API_KEY);
}

export type Polarite = 'positif' | 'negatif';

/** A single facet of the referential (one axis entry), in the shape the prompt needs. */
export type FacetLite = {
	code: string;
	label: string;
	description?: string | null;
};

/** The active facet referential for a product: objects (product-specific) + site themes. */
export type FacetReferential = {
	objets: FacetLite[];
	thematiques: FacetLite[];
};

export type ClassificationResult = {
	/** Objet codes chosen (subset of referential objet codes). */
	objets: string[];
	/** Thématique site codes chosen (subset of referential thematique codes). */
	thematiques: string[];
	/** Polarity: [] = neutre, [positif, negatif] = mitigé. */
	polarite: Polarite[];
	/** One-sentence justification quoting the verbatim. */
	pourquoi: string;
	/** Model-reported confidence in [0, 1]. */
	confiance: number;
	/** The model id/alias actually used. */
	model: string;
	/** The prompt/contract version used. */
	prompt_version: string;
};

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function block(facets: FacetLite[]): string {
	return facets
		.map(f => `- ${f.code} : ${f.label}${f.description ? ` — ${f.description}` : ''}`)
		.join('\n');
}

function buildSystemPrompt(ref: FacetReferential, demarcheLabel?: string): string {
	const ctx = demarcheLabel ? ` (${demarcheLabel})` : '';
	return [
		`Tu classes le verbatim d'un usager sur une démarche administrative en ligne${ctx} selon`,
		'TROIS axes INDÉPENDANTS. Fonde-toi UNIQUEMENT sur le texte, n\'invente rien. Réponds via',
		'le format structuré.',
		'',
		'AXE A — OBJET(S) : le produit / la rubrique EXPLICITEMENT nommé(e). 0, 1 ou plusieurs.',
		'VIDE si le verbatim ne vise aucun objet précis (ressenti général, jugement global).',
		'AXE B — THÉMATIQUE(S) SITE (0 à 3) : la nature de la difficulté rencontrée sur l\'OUTIL en',
		'ligne. Tague une difficulté dès qu\'elle est CLAIREMENT exprimée, MÊME sans viser un écran',
		'précis (un jugement global de complexité/lourdeur → complexite_charge s\'il existe). Ne mets',
		'pas toutes les thématiques : choisis la/les plus pertinentes. VIDE UNIQUEMENT si le verbatim',
		'NE PARLE PAS de l\'outil : montant/coût de la démarche, fiscalité, politique, remerciement',
		'pur, ou question de droit/réglementation.',
		'AXE C — POLARITÉ (0 à 2) : positif si satisfaction exprimée, negatif si insatisfaction ;',
		'LES DEUX si mitigé ; VIDE si aucun sentiment (constat factuel, question).',
		'',
		'pourquoi : 1 phrase citant le texte. confiance : 0 à 1.',
		'',
		'OBJETS disponibles :',
		block(ref.objets) || '(aucun)',
		'',
		'THÉMATIQUES SITE disponibles :',
		block(ref.thematiques) || '(aucune)'
	].join('\n');
}

function buildResponseFormat(ref: FacetReferential) {
	const objCodes = ref.objets.map(f => f.code);
	const themeCodes = ref.thematiques.map(f => f.code);
	return {
		type: 'json_schema',
		json_schema: {
			name: 'facettes_avis',
			strict: true,
			schema: {
				type: 'object',
				additionalProperties: false,
				properties: {
					objets: {
						type: 'array',
						items: { type: 'string', enum: objCodes },
						description: '0, 1 ou plusieurs objets (vide si aucun objet précis)'
					},
					thematiques: {
						type: 'array',
						items: { type: 'string', enum: themeCodes },
						description: '0 à 3 thématiques site (vide si ressenti global)'
					},
					polarite: {
						type: 'array',
						items: { type: 'string', enum: ['positif', 'negatif'] },
						description: '[] = neutre, [positif, negatif] = mitigé'
					},
					pourquoi: { type: 'string', description: 'Justification citant le texte' },
					confiance: { type: 'number', description: 'Confiance dans [0,1]' }
				},
				required: ['objets', 'thematiques', 'polarite', 'pourquoi', 'confiance']
			}
		}
	};
}

export type ClassifyOptions = {
	model?: string;
	/** Optional factual label of the démarche, injected in the prompt for finer labels. */
	demarcheLabel?: string;
	/** AbortSignal for timeout/cancellation. */
	signal?: AbortSignal;
};

/**
 * Classify a single verbatim against the provided facet referential. Throws on transport/HTTP
 * errors or on an unparseable response so the caller (worker) can retry.
 */
export async function classifyVerbatim(
	text: string,
	ref: FacetReferential,
	opts: ClassifyOptions = {}
): Promise<ClassificationResult> {
	if (!BASE_URL || !API_KEY) {
		throw new Error(
			'Albert is not configured (set ALBERT_API_BASE_URL and ALBERT_API_KEY).'
		);
	}
	if (ref.objets.length === 0 && ref.thematiques.length === 0) {
		throw new Error('classifyVerbatim called with an empty referential.');
	}

	const model = opts.model || DEFAULT_MODEL;
	const messages: ChatMessage[] = [
		{ role: 'system', content: buildSystemPrompt(ref, opts.demarcheLabel) },
		{ role: 'user', content: `Verbatim :\n${text.slice(0, 1500)}` }
	];

	const res = await fetch(`${BASE_URL}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${API_KEY}`
		},
		body: JSON.stringify({
			model,
			messages,
			temperature: 0,
			response_format: buildResponseFormat(ref)
		}),
		signal: opts.signal
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(
			`Albert chat/completions failed: ${res.status} ${res.statusText} — ${body.slice(0, 500)}`
		);
	}

	const data = (await res.json()) as {
		choices?: { message?: { content?: string } }[];
	};
	const content = data.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error('Albert response had no message content.');
	}

	let parsed: {
		objets?: unknown;
		thematiques?: unknown;
		polarite?: unknown;
		pourquoi?: unknown;
		confiance?: unknown;
	};
	try {
		parsed = JSON.parse(content);
	} catch {
		throw new Error(`Albert returned non-JSON content: ${content.slice(0, 500)}`);
	}

	const objCodes = new Set(ref.objets.map(f => f.code));
	const themeCodes = new Set(ref.thematiques.map(f => f.code));
	const asCodes = (v: unknown, valid: Set<string>): string[] =>
		Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && valid.has(x)))] : [];
	const asPolarite = (v: unknown): Polarite[] =>
		Array.isArray(v)
			? [...new Set(v.filter((x): x is Polarite => x === 'positif' || x === 'negatif'))]
			: [];

	const confiance =
		typeof parsed.confiance === 'number' ? Math.max(0, Math.min(1, parsed.confiance)) : 0;

	return {
		objets: asCodes(parsed.objets, objCodes),
		thematiques: asCodes(parsed.thematiques, themeCodes),
		polarite: asPolarite(parsed.polarite),
		pourquoi: typeof parsed.pourquoi === 'string' ? parsed.pourquoi : '',
		confiance,
		model,
		prompt_version: CLASSIFICATION_PROMPT_VERSION
	};
}
