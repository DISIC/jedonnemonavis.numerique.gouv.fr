import { stringify } from 'csv-stringify';
import type { Writable } from 'stream';

export type ReviewRow = {
	review_id: string;
	review_created_at: Date;
	form_name: string;
	button_name: string;
	answers: Record<string, string>;
};

export type TemplateColumn = {
	code: string;
	label: string;
};

function buildHeader(columns: TemplateColumn[]): string[] {
	return [
		"Date de l'avis",
		'Nom du formulaire',
		"Lien d'intégration",
		'Identifiant Avis',
		...columns.map(c => c.label)
	];
}

function buildCsvRow(review: ReviewRow, columns: TemplateColumn[]): string[] {
	return [
		review.review_created_at.toISOString().replace('T', ' ').substring(0, 19),
		review.form_name,
		review.button_name,
		review.review_id,
		...columns.map(c => review.answers[c.code] ?? '')
	];
}

/**
 * Streams CSV rows to the writable stream as they arrive from the async iterable.
 * Memory stays bounded — only one row is in flight at a time.
 */
export async function generateCsvStream(
	reviews: AsyncIterable<ReviewRow>,
	columns: TemplateColumn[],
	out: Writable
): Promise<void> {
	const stringifier = stringify({ bom: false });
	stringifier.pipe(out, { end: false });

	stringifier.write(buildHeader(columns));
	for await (const review of reviews) {
		stringifier.write(buildCsvRow(review, columns));
	}

	await new Promise<void>((resolve, reject) => {
		stringifier.on('end', () => resolve());
		stringifier.on('error', reject);
		stringifier.end();
	});

	out.end();
}
