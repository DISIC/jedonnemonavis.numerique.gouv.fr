import { stringify } from 'csv-stringify/sync';

export type ReviewRow = {
	review_id: string;
	review_created_at: string;
	answers: Record<string, string>;
};

export function generateCsvBuffer(
	reviews: ReviewRow[],
	fieldLabels: string[]
): Buffer {
	const header = [
		'Review ID',
		'Review Created At',
		...fieldLabels
	];

	const rows = reviews.map(review => [
		review.review_id,
		review.review_created_at,
		...fieldLabels.map(label => review.answers[label] ?? '')
	]);

	const csv = stringify([header, ...rows]);
	return Buffer.from(csv, 'utf-8');
}
