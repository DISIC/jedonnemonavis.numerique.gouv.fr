import type { FacetAxis } from '@prisma/client';
import prisma from '@/src/utils/db';
import { classifyVerbatim, type FacetReferential } from '@/src/lib/albert';
import { writeAnswerFacets } from './es';

type FacetRow = {
	id: number;
	axis: FacetAxis;
	code: string;
	label: string;
	description: string | null;
};

// Petit cache in-process du référentiel PAR PRODUIT (on ne recharge pas à chaque job).
const refCache = new Map<number, { at: number; rows: FacetRow[] }>();
const REF_TTL_MS = 60_000;

async function getFacets(productId: number): Promise<FacetRow[]> {
	const cached = refCache.get(productId);
	const now = Date.now();
	if (cached && now - cached.at < REF_TTL_MS) return cached.rows;
	const rows = await prisma.classificationFacet.findMany({
		where: { active: true, OR: [{ product_id: productId }, { product_id: null }] },
		orderBy: [{ axis: 'asc' }, { position: 'asc' }],
		select: { id: true, axis: true, code: true, label: true, description: true }
	});
	refCache.set(productId, { at: now, rows });
	return rows;
}

/**
 * Core classification step for one review: load its verbatim + product referential, classify it
 * via Albert on the 3 facet axes, and upsert the result into ReviewClassification (+ the
 * per-facet join rows). Postgres = source of truth; facets are denormalised into Elasticsearch.
 *
 * Pure of any transport concern (no BullMQ/Redis) so it can be driven by the worker, a backfill
 * script, or a test. Throws on failure so the caller (worker) can retry.
 */
export async function classifyReview(
	reviewId: number,
	createdAt: Date
): Promise<void> {
	const review = await prisma.review.findFirst({
		where: { id: reviewId, created_at: createdAt },
		select: { product_id: true, product: { select: { title: true } } }
	});

	const verbatim = await prisma.answer.findFirst({
		where: { review_id: reviewId, field_code: 'verbatim' },
		orderBy: { created_at: 'desc' },
		select: { id: true, answer_text: true }
	});

	const text = verbatim?.answer_text?.trim();
	if (!verbatim || !text) {
		console.log(`[classification] Review ${reviewId}: no verbatim text, skipping.`);
		return;
	}
	if (!review?.product_id) {
		console.log(`[classification] Review ${reviewId}: no product, skipping.`);
		return;
	}

	const facets = await getFacets(review.product_id);
	if (facets.length === 0) {
		// Throw → caller retries; the referential is expected to be seeded for this product.
		throw new Error(
			`Empty facet referential for product ${review.product_id} (run \`yarn db:seed-classification\`).`
		);
	}
	const ref: FacetReferential = {
		objets: facets
			.filter(f => f.axis === 'objet')
			.map(f => ({ code: f.code, label: f.label, description: f.description })),
		thematiques: facets
			.filter(f => f.axis === 'thematique_site')
			.map(f => ({ code: f.code, label: f.label, description: f.description }))
	};

	const result = await classifyVerbatim(text, ref, {
		demarcheLabel: review.product?.title ?? undefined
	});

	// Map (axis, code) -> facet_id for the join rows.
	const idByKey = new Map(facets.map(f => [`${f.axis}:${f.code}`, f.id] as const));
	const joinRows = [
		...result.objets.map(code => ({ axis: 'objet' as FacetAxis, code })),
		...result.thematiques.map(code => ({ axis: 'thematique_site' as FacetAxis, code }))
	]
		.map(x => ({ ...x, facet_id: idByKey.get(`${x.axis}:${x.code}`) }))
		.filter((x): x is { axis: FacetAxis; code: string; facet_id: number } => x.facet_id != null);

	await prisma.$transaction(async tx => {
		const rc = await tx.reviewClassification.upsert({
			where: {
				review_id_review_created_at: {
					review_id: reviewId,
					review_created_at: createdAt
				}
			},
			create: {
				review_id: reviewId,
				review_created_at: createdAt,
				polarite: result.polarite,
				pourquoi: result.pourquoi,
				confiance: result.confiance,
				model_name: result.model,
				prompt_version: result.prompt_version,
				status: 'predicted'
			},
			update: {
				polarite: result.polarite,
				pourquoi: result.pourquoi,
				confiance: result.confiance,
				model_name: result.model,
				prompt_version: result.prompt_version,
				status: 'predicted'
			},
			select: { id: true }
		});
		await tx.reviewClassificationFacet.deleteMany({
			where: { classification_id: rc.id }
		});
		if (joinRows.length > 0) {
			await tx.reviewClassificationFacet.createMany({
				data: joinRows.map(f => ({
					classification_id: rc.id,
					facet_id: f.facet_id,
					axis: f.axis,
					code: f.code,
					source: 'predicted' as const
				}))
			});
		}
	});

	// Best-effort denormalisation into Elasticsearch (never throws; PG is the source of truth).
	await writeAnswerFacets(verbatim.id, {
		objets: result.objets,
		thematiques: result.thematiques,
		polarite: result.polarite,
		pourquoi: result.pourquoi,
		confiance: result.confiance,
		classe_source: 'predicted'
	});

	console.log(
		`[classification] Review ${reviewId} → objets=[${result.objets.join(',')}] ` +
			`th=[${result.thematiques.join(',')}] pol=[${result.polarite.join(',')}] ` +
			`(conf ${result.confiance.toFixed(2)})`
	);
}
