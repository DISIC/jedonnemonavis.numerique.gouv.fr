import elk, { JDMA_ANSWERS_INDEX } from '@/src/lib/elk';

/** Facettes dénormalisées sur le document `jdma-answers` du verbatim (stats Kibana). */
export type AnswerFacetFields = {
	objets: string[]; // codes d'objets (axe A)
	thematiques: string[]; // codes de thématiques site (axe B)
	polarite: string[]; // [] = neutre, ['positif','negatif'] = mitigé
	pourquoi: string;
	confiance: number;
	classe_source: 'predicted' | 'validated';
};

/**
 * Best-effort denormalisation of a verbatim's facets onto its `jdma-answers` document, for
 * Kibana stats and facet exploration. Postgres remains the source of truth — a missing or
 * unreachable Elasticsearch must never fail the caller, so failures are logged and swallowed
 * (the backfill/reindex path is the safety net).
 *
 * `answerId` is the verbatim Answer.id, which is the ES document id in `jdma-answers`.
 */
export async function writeAnswerFacets(
	answerId: number,
	fields: AnswerFacetFields
): Promise<void> {
	if (!elk) return;

	try {
		await elk.update({
			index: JDMA_ANSWERS_INDEX,
			id: answerId.toString(),
			body: { doc: fields }
		});
	} catch (err) {
		console.error(
			`[classification] ES update failed for answer ${answerId} (non-fatal):`,
			(err as Error).message
		);
	}
}
