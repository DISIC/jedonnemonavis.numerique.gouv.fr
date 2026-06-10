import elk, { JDMA_ANSWERS_INDEX } from '../src/lib/elk';

/**
 * Add the classification fields to the `jdma-answers` mapping. Idempotent: adding fields of
 * the same type is a no-op, so this is safe to run on every deploy. Run:
 * `yarn es:classify-mapping`.
 *
 * Note: adding fields to an existing mapping does NOT require a reindex; existing documents
 * simply have the fields absent until (re)written. Newly-classified verbatims get them via
 * the worker; historical docs get them at backfill time.
 */
const PROPERTIES = {
	classe: { type: 'keyword' as const },
	classe_theme: { type: 'keyword' as const },
	classe_score: { type: 'float' as const },
	classe_source: { type: 'keyword' as const }
};

async function main() {
	if (!elk) {
		console.error('ES_ADDON_URI not set — cannot update mapping.');
		process.exit(1);
	}

	const exists = await elk.indices.exists({ index: JDMA_ANSWERS_INDEX });
	if (!exists) {
		console.warn(
			`Index "${JDMA_ANSWERS_INDEX}" does not exist yet. It is created when answers are first indexed by the form app — re-run this script afterwards.`
		);
		return;
	}

	await elk.indices.putMapping({
		index: JDMA_ANSWERS_INDEX,
		body: { properties: PROPERTIES }
	});

	console.log(
		`[es:classify-mapping] Mapping updated on "${JDMA_ANSWERS_INDEX}": classe, classe_theme, classe_score, classe_source.`
	);
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => {
		// ES client keeps no long-lived handles that block exit, but be explicit.
		process.exit(0);
	});
