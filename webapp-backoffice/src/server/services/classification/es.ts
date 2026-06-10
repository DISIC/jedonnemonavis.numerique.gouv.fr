import elk, { JDMA_ANSWERS_INDEX } from '@/src/lib/elk';

export type AnswerClasseFields = {
	classe: string; // level-2 problématique code
	classe_theme: string; // level-1 thème code
	classe_score: number;
	classe_source: 'predicted' | 'validated';
};

/**
 * Best-effort denormalisation of a verbatim's class onto its `jdma-answers` document, for
 * Kibana stats and category exploration. Postgres remains the source of truth — a missing
 * or unreachable Elasticsearch must never fail the caller, so failures are logged and
 * swallowed (the backfill/reindex path is the safety net).
 *
 * `answerId` is the verbatim Answer.id, which is the ES document id in `jdma-answers`.
 */
export async function writeAnswerClasse(
	answerId: number,
	fields: AnswerClasseFields
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
