/**
 * Minimal Albert API client (DINUM/Etalab, OpenAI-compatible).
 *
 * Albert exposes an OpenAI-compatible surface under a `/v1` base path. We only need a thin
 * wrapper around `POST /v1/chat/completions` for classification, with structured output
 * enforced via `response_format: { type: 'json_schema' }`.
 *
 * Config (env, backoffice only — the form app never calls Albert directly):
 *   ALBERT_API_BASE_URL  e.g. https://albert.api.etalab.gouv.fr/v1
 *   ALBERT_API_KEY       bearer token
 *   ALBERT_CHAT_MODEL    model id/alias, default "openweight-small" (Ministral-3-8B)
 */

const BASE_URL = process.env.ALBERT_API_BASE_URL;
const API_KEY = process.env.ALBERT_API_KEY;
const DEFAULT_MODEL = process.env.ALBERT_CHAT_MODEL || 'openweight-small';

/**
 * Bumped whenever the prompt or the structured-output contract changes. Stored on each
 * ReviewClassification so predictions can be tied back to the exact prompt that produced them.
 */
export const CLASSIFICATION_PROMPT_VERSION = 'classif-v2';

export function isAlbertConfigured(): boolean {
	return Boolean(BASE_URL && API_KEY);
}

export type ClassificationCategoryLite = {
	code: string;
	label: string;
	description?: string | null;
	/** Parent theme (level-1) stable code — denormalised into ES as `classe_theme`. */
	theme_code: string;
	/** Parent theme (level-1) human label — used in the prompt for disambiguation. */
	theme_label: string;
};

export type ClassificationResult = {
	/** ClassificationCategory.code chosen by the model (guaranteed to be one of the catalogue codes). */
	code: string;
	/** Model-reported confidence in [0, 1]. */
	score: number;
	/** The model id/alias actually used. */
	model: string;
	/** The prompt/contract version used. */
	prompt_version: string;
};

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function buildCatalogueBlock(categories: ClassificationCategoryLite[]): string {
	return categories
		.map(c => {
			const desc = c.description ? ` — ${c.description}` : '';
			return `- ${c.code} (${c.theme_label} › ${c.label})${desc}`;
		})
		.join('\n');
}

function buildSystemPrompt(categories: ClassificationCategoryLite[]): string {
	return [
		"Tu es un classifieur de verbatims d'usagers sur des démarches administratives en ligne.",
		"Le commentaire est censé être un RETOUR D'EXPÉRIENCE sur l'utilisation de la démarche",
		'en ligne : ce qui a bien ou mal fonctionné pour l\'usager. Tu dois le ranger dans',
		'EXACTEMENT une seule catégorie du catalogue ci-dessous, en renvoyant son code.',
		'',
		'Catalogue des catégories (code (thème › problématique) — description) :',
		buildCatalogueBlock(categories),
		'',
		'Règles :',
		'- Choisis le code le plus pertinent. Un seul.',
		"- IMPORTANT — hors-sujet : si le commentaire n'est PAS un retour sur l'expérience",
		"  d'utilisation de la démarche, classe-le en « autre_inclassable ». C'est notamment le",
		'  cas des DEMANDES DIRECTES adressées à l\'administration (ex. « je souhaite bénéficier',
		"  d'une aide », « pouvez-vous m'accorder… », une question personnelle, l'exposé d'une",
		'  situation), des simples salutations/remerciements sans contenu, et de tout message',
		"  hors-sujet — MÊME s'il contient des mots comme « aide », « support » ou « contact ».",
		'- Les problématiques d\'« Accompagnement et support » désignent une PLAINTE sur le manque',
		"  d'aide, de contact ou sur les délais DU SERVICE — PAS un usager qui sollicite une aide.",
		'- Utilise aussi « autre_inclassable » si le commentaire est vide, trop court ou trop',
		'  ambigu pour décider.',
		'- « score » exprime ta confiance dans [0,1] (1 = certain, 0 = très incertain). Mets un',
		'  score bas quand tu hésites.',
		'- Réponds UNIQUEMENT via le format structuré demandé, sans texte additionnel.'
	].join('\n');
}

function buildResponseFormat(categories: ClassificationCategoryLite[]) {
	return {
		type: 'json_schema',
		json_schema: {
			name: 'verbatim_classification',
			strict: true,
			schema: {
				type: 'object',
				additionalProperties: false,
				properties: {
					code: {
						type: 'string',
						enum: categories.map(c => c.code),
						description: 'Code de la catégorie choisie'
					},
					score: {
						type: 'number',
						description: 'Confiance dans [0,1]'
					}
				},
				required: ['code', 'score']
			}
		}
	};
}

export type ClassifyOptions = {
	model?: string;
	/** AbortSignal for timeout/cancellation. */
	signal?: AbortSignal;
};

/**
 * Classify a single verbatim against the provided catalogue. Throws on transport/HTTP
 * errors or on an unparseable response so the caller (worker) can retry.
 */
export async function classifyVerbatim(
	text: string,
	categories: ClassificationCategoryLite[],
	opts: ClassifyOptions = {}
): Promise<ClassificationResult> {
	if (!BASE_URL || !API_KEY) {
		throw new Error(
			'Albert is not configured (set ALBERT_API_BASE_URL and ALBERT_API_KEY).'
		);
	}
	if (categories.length === 0) {
		throw new Error('classifyVerbatim called with an empty catalogue.');
	}

	const model = opts.model || DEFAULT_MODEL;
	const messages: ChatMessage[] = [
		{ role: 'system', content: buildSystemPrompt(categories) },
		{ role: 'user', content: text }
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
			response_format: buildResponseFormat(categories)
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

	let parsed: { code?: unknown; score?: unknown };
	try {
		parsed = JSON.parse(content);
	} catch {
		throw new Error(`Albert returned non-JSON content: ${content.slice(0, 500)}`);
	}

	const code = typeof parsed.code === 'string' ? parsed.code : null;
	const score = typeof parsed.score === 'number' ? parsed.score : null;
	if (!code || score === null) {
		throw new Error(
			`Albert returned an unexpected shape: ${JSON.stringify(parsed).slice(0, 500)}`
		);
	}

	// Defensive: the json_schema enum should already guarantee this, but never trust the wire.
	const validCodes = new Set(categories.map(c => c.code));
	if (!validCodes.has(code)) {
		throw new Error(`Albert returned an out-of-catalogue code: "${code}".`);
	}

	return {
		code,
		score: Math.max(0, Math.min(1, score)),
		model,
		prompt_version: CLASSIFICATION_PROMPT_VERSION
	};
}
