import { stringify } from 'csv-stringify/sync';

export type ReviewRow = {
	review_id: string;
	form_id: number | null;
	product_id: number;
	button_id: string | null;
	xwiki_id: string | null;
	review_created_at: string;
	answers: Record<string, string>;
};

export function generateCsvBuffer(
	reviews: ReviewRow[],
	fieldLabels: string[]
): Buffer {
	const header = [
		'Review ID',
		'Form ID',
		'Product ID',
		'Button ID',
		'XWiki ID',
		'Review Created At',
		...fieldLabels
	];

	const rows = reviews.map(review => [
		review.review_id,
		review.form_id,
		review.product_id,
		review.button_id,
		review.xwiki_id,
		review.review_created_at,
		...fieldLabels.map(label => review.answers[label] ?? '')
	]);

	const csv = stringify([header, ...rows]);
	return Buffer.from(csv, 'utf-8');
}
