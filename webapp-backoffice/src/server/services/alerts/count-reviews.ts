import type { PrismaClient } from '@prisma/client';

export type AlertBatchCounts = {
	total: number;
	withComments: number;
};

/**
 * Counts reviews on a form between an exclusive lower bound (`cursor`) and an
 * inclusive upper bound (`upTo`). `withComments` counts the subset that has
 * `has_verbatim = true` (set by createOrUpdateAnswers when a verbatim answer
 * is stored).
 */
export async function countReviewsForBatch(
	prisma: PrismaClient,
	formId: number,
	cursor: Date,
	upTo: Date
): Promise<AlertBatchCounts> {
	const baseWhere = {
		form_id: formId,
		created_at: { gt: cursor, lte: upTo }
	} as const;

	const [total, withComments] = await Promise.all([
		prisma.review.count({ where: baseWhere }),
		prisma.review.count({ where: { ...baseWhere, has_verbatim: true } })
	]);

	return { total, withComments };
}
