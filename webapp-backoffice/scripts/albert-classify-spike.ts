import { PrismaClient } from '@prisma/client';
import {
	classifyVerbatim,
	isAlbertConfigured,
	type FacetReferential
} from '../src/lib/albert';

const prisma = new PrismaClient();

/**
 * Spike: classify a handful of representative verbatims end-to-end against the seeded facet
 * referential, to validate the Albert client, the structured (3-facet) output and the prompt
 * before running the batch worker. Run: `yarn tsx scripts/albert-classify-spike.ts`.
 * Requires ALBERT_* env vars + a seeded ClassificationFacet table (`yarn db:seed-classification`).
 *
 * Optionally scope objets to a product: `SPIKE_PRODUCT_ID=3059 yarn tsx scripts/albert-classify-spike.ts`.
 * Without it, only the global site themes (objets stay empty) are offered.
 */

// Representative samples with the site theme(s) we'd intuitively expect.
const SAMPLES: { text: string; expected: string }[] = [
	{
		text: 'Impossible de me connecter avec FranceConnect, ça plante systématiquement.',
		expected: 'auth_connexion'
	},
	{
		text: "Le site est extrêmement lent, j'ai attendu plusieurs minutes pour charger une page.",
		expected: 'bugs_lags'
	},
	{
		text: "Je ne comprends rien aux consignes, c'est rempli de jargon administratif.",
		expected: 'clarte_infos'
	},
	{
		text: 'Démarche simple et rapide, merci beaucoup !',
		expected: 'satisfaction'
	},
	{
		text: 'Impossible de téléverser mon justificatif de domicile, le format est refusé.',
		expected: 'documents_pj'
	},
	{
		text: 'Formulaire interminable, beaucoup trop de champs à remplir.',
		expected: 'navigation_ergonomie / complexite_charge'
	},
	{
		text: "Personne pour m'aider, aucun numéro de téléphone ni contact.",
		expected: 'support_contact'
	},
	{ text: 'azerty azerty', expected: '(bruit — aucune thématique)' }
];

async function loadReferential(
	productId: number | null
): Promise<FacetReferential> {
	const facets = await prisma.classificationFacet.findMany({
		where: {
			active: true,
			OR: [
				{ axis: 'thematique_site' },
				...(productId !== null
					? [{ axis: 'objet' as const, product_id: productId }]
					: [])
			]
		},
		orderBy: [{ axis: 'asc' }, { position: 'asc' }],
		select: { axis: true, code: true, label: true, description: true }
	});
	return {
		objets: facets
			.filter(f => f.axis === 'objet')
			.map(f => ({ code: f.code, label: f.label, description: f.description ?? undefined })),
		thematiques: facets
			.filter(f => f.axis === 'thematique_site')
			.map(f => ({ code: f.code, label: f.label, description: f.description ?? undefined }))
	};
}

async function main() {
	if (!isAlbertConfigured()) {
		console.error(
			'Albert not configured. Set ALBERT_API_BASE_URL and ALBERT_API_KEY in .env.'
		);
		process.exit(1);
	}

	const productId = process.env.SPIKE_PRODUCT_ID
		? parseInt(process.env.SPIKE_PRODUCT_ID, 10)
		: null;
	const ref = await loadReferential(productId);
	if (ref.thematiques.length === 0) {
		console.error(
			'No active site themes found. Run `yarn db:seed-classification` first.'
		);
		process.exit(1);
	}

	console.log(
		`Référentiel: ${ref.objets.length} objets · ${ref.thematiques.length} thématiques · modèle: ${
			process.env.ALBERT_CHAT_MODEL || 'openweight-medium'
		}\n`
	);

	let okCount = 0;
	for (const sample of SAMPLES) {
		const started = Date.now();
		try {
			const result = await classifyVerbatim(sample.text, ref);
			const ms = Date.now() - started;
			const hit = result.thematiques.some(code => sample.expected.includes(code));
			if (hit) okCount++;
			console.log(`[${hit ? '✓' : '≈'}] "${sample.text}"`);
			console.log(
				`     → objets: [${result.objets.join(', ')}] · thématiques: [${result.thematiques.join(
					', '
				)}] · polarité: [${result.polarite.join(', ')}] (conf ${result.confiance.toFixed(
					2
				)}, ${ms} ms)  | attendu: ${sample.expected}`
			);
			if (result.pourquoi) console.log(`       « ${result.pourquoi} »`);
			console.log('');
		} catch (err) {
			console.log(`[✗] "${sample.text}"`);
			console.log(`     → ERREUR: ${(err as Error).message}\n`);
		}
	}

	console.log(
		`Résultat: ${okCount}/${SAMPLES.length} avec la thématique attendue (indicatif, les cas ambigus peuvent varier).`
	);
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
