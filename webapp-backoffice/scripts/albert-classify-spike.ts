import { PrismaClient } from '@prisma/client';
import {
	classifyVerbatim,
	isAlbertConfigured,
	type ClassificationCategoryLite
} from '../src/lib/albert';

const prisma = new PrismaClient();

/**
 * Spike: classify a handful of representative verbatims end-to-end against the seeded
 * catalogue, to validate the Albert client, the structured output, and the prompt before
 * building the realtime worker. Run: `yarn tsx scripts/albert-classify-spike.ts`
 * (or add an npm script). Requires ALBERT_* env vars + a seeded ClassificationCategory table.
 */

// Representative samples (with the category we'd intuitively expect).
const SAMPLES: { text: string; expected: string }[] = [
	{
		text: 'Impossible de me connecter avec FranceConnect, ça plante systématiquement.',
		expected: 'auth_franceconnect'
	},
	{
		text: "Le site est extrêmement lent, j'ai attendu plusieurs minutes pour charger une page.",
		expected: 'tech_lenteur'
	},
	{
		text: "Je ne comprends rien aux consignes, c'est rempli de jargon administratif.",
		expected: 'clarte_jargon / clarte_instructions'
	},
	{
		text: 'Démarche simple et rapide, merci beaucoup !',
		expected: 'satisfaction_simple_rapide / satisfaction_positif'
	},
	{
		text: 'Impossible de téléverser mon justificatif de domicile, le format est refusé.',
		expected: 'documents_televersement'
	},
	{
		text: 'Formulaire interminable, beaucoup trop de champs à remplir.',
		expected: 'ux_formulaire_complexe'
	},
	{
		text: "Personne pour m'aider, aucun numéro de téléphone ni contact.",
		expected: 'support_manque_aide'
	},
	{ text: 'azerty azerty', expected: 'autre_inclassable (bruit)' }
];

async function loadCatalogue(): Promise<ClassificationCategoryLite[]> {
	const cats = await prisma.classificationCategory.findMany({
		where: { level: 2, active: true },
		include: { parent: true },
		orderBy: [{ parent_id: 'asc' }, { position: 'asc' }]
	});
	return cats.map(c => ({
		code: c.code,
		label: c.label,
		description: c.description,
		theme_code: c.parent?.code ?? '',
		theme_label: c.parent?.label ?? ''
	}));
}

async function main() {
	if (!isAlbertConfigured()) {
		console.error(
			'Albert not configured. Set ALBERT_API_BASE_URL and ALBERT_API_KEY in .env.'
		);
		process.exit(1);
	}

	const categories = await loadCatalogue();
	if (categories.length === 0) {
		console.error(
			'No level-2 categories found. Run `yarn db:seed-classification` first.'
		);
		process.exit(1);
	}

	console.log(
		`Catalogue: ${categories.length} problématiques · modèle: ${process.env.ALBERT_CHAT_MODEL || 'openweight-small'}\n`
	);

	let okCount = 0;
	for (const sample of SAMPLES) {
		const started = Date.now();
		try {
			const result = await classifyVerbatim(sample.text, categories);
			const ms = Date.now() - started;
			const hit = sample.expected.includes(result.code) ? '✓' : '≈';
			if (sample.expected.includes(result.code)) okCount++;
			console.log(`[${hit}] "${sample.text}"`);
			console.log(
				`     → ${result.code}  (score ${result.score.toFixed(2)}, ${ms} ms)  | attendu: ${sample.expected}\n`
			);
		} catch (err) {
			console.log(`[✗] "${sample.text}"`);
			console.log(`     → ERREUR: ${(err as Error).message}\n`);
		}
	}

	console.log(
		`Résultat: ${okCount}/${SAMPLES.length} dans la catégorie attendue (indicatif, le "bon" code peut varier sur les cas ambigus).`
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
