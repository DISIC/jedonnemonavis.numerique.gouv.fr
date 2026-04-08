import { stringify } from 'csv-stringify/sync';

export type ReviewRow = {
	review_id: string;
	review_created_at: string;
	answers: Record<string, string>; // keyed by field_code
};

export type TemplateColumn = {
	code: string;
	label: string;
};

export function generateCsvBuffer(
	reviews: ReviewRow[],
	columns: TemplateColumn[]
): Buffer {
	const header = [
		'Review ID',
		'Review Created At',
		...columns.map(c => c.label)
	];

	const rows = reviews.map(review => [
		review.review_id,
		review.review_created_at,
		...columns.map(c => review.answers[c.code] ?? '')
	]);

	const csv = stringify([header, ...rows]);
	return Buffer.from(csv, 'utf-8');
}
