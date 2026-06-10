import prisma from '@/src/utils/db';
import {
	classifyVerbatim,
	type ClassificationCategoryLite
} from '@/src/lib/albert';
import { loadActiveCatalogue } from './catalog';
import { writeAnswerClasse } from './es';

// Small in-process cache so we don't reload the small catalogue on every single job.
let catalogueCache: { at: number; data: ClassificationCategoryLite[] } | null =
	null;
const CATALOGUE_TTL_MS = 60_000;

async function getCatalogue(): Promise<ClassificationCategoryLite[]> {
	const now = Date.now();
	if (catalogueCache && now - catalogueCache.at < CATALOGUE_TTL_MS) {
		return catalogueCache.data;
	}
	const data = await loadActiveCatalogue(prisma);
	catalogueCache = { at: now, data };
	return data;
}

/**
 * Core classification step for one review: load its verbatim, classify it via Albert, and
 * upsert the result into ReviewClassification (Postgres = source of truth).
 *
 * Pure of any transport concern (no BullMQ/Redis) so it can be driven by the worker, a
 * backfill script, or a test. Throws on failure so the caller (worker) can retry.
 */
export async function classifyReview(
	reviewId: number,
	createdAt: Date
): Promise<void> {
	// Load the verbatim free-text answer for this review (its id is the ES document id).
	const verbatim = await prisma.answer.findFirst({
		where: { review_id: reviewId, field_code: 'verbatim' },
		orderBy: { created_at: 'desc' },
		select: { id: true, answer_text: true }
	});

	const text = verbatim?.answer_text?.trim();
	if (!verbatim || !text) {
		console.log(
			`[classification] Review ${reviewId}: no verbatim text, skipping.`
		);
		return;
	}

	const categories = await getCatalogue();
	if (categories.length === 0) {
		// Throw → caller retries; the catalogue is expected to be seeded.
		throw new Error(
			'Empty classification catalogue (run `yarn db:seed-classification`).'
		);
	}

	const result = await classifyVerbatim(text, categories);
	const themeCode =
		categories.find(c => c.code === result.code)?.theme_code ?? '';

	await prisma.reviewClassification.upsert({
		where: {
			review_id_review_created_at: {
				review_id: reviewId,
				review_created_at: createdAt
			}
		},
		create: {
			review_id: reviewId,
			review_created_at: createdAt,
			predicted_code: result.code,
			predicted_score: result.score,
			model_name: result.model,
			prompt_version: result.prompt_version,
			status: 'predicted'
		},
		update: {
			predicted_code: result.code,
			predicted_score: result.score,
			model_name: result.model,
			prompt_version: result.prompt_version,
			status: 'predicted'
		}
	});

	// Best-effort denormalisation into Elasticsearch for Kibana stats / category exploration.
	// Never throws (Postgres is the source of truth).
	await writeAnswerClasse(verbatim.id, {
		classe: result.code,
		classe_theme: themeCode,
		classe_score: result.score,
		classe_source: 'predicted'
	});

	console.log(
		`[classification] Review ${reviewId} → ${result.code} (score ${result.score.toFixed(
			2
		)})`
	);
}
