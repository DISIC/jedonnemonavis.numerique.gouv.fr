import type { PrismaClient } from '@prisma/client';
import { classificationJobId, classificationQueue } from '@/src/lib/queue';

/**
 * Fire-and-forget producer: enqueue a classification job for a freshly-created review.
 *
 * Called from the review-create mutations (both the static `createReview` and the
 * `dynamicCreateReviewMutation`). Wrapped by the caller in `void` + the try/catch here, so a
 * failure never breaks review submission. Only reviews that actually carry a verbatim are
 * enqueued — classifying an avis with no free-text answer is pointless.
 *
 * No Redis configured (e.g. dev env without a Redis addon) → graceful no-op.
 */
export async function enqueueReviewClassification(
	prisma: PrismaClient,
	reviewId: number,
	reviewCreatedAt: Date
): Promise<void> {
	try {
		if (!classificationQueue) return;

		const review = await prisma.review.findUnique({
			where: {
				id_created_at: { id: reviewId, created_at: reviewCreatedAt }
			},
			select: { has_verbatim: true }
		});
		if (!review?.has_verbatim) return;

		// Stable jobId → re-enqueuing the same review replaces the pending job rather than
		// piling up duplicates (idempotent with the worker's upsert).
		await classificationQueue.add(
			'classify',
			{ reviewId, reviewCreatedAt: reviewCreatedAt.toISOString() },
			{ jobId: classificationJobId(reviewId) }
		);
	} catch (err) {
		console.error(
			`[classification] enqueue failed for review ${reviewId}:`,
			err
		);
	}
}
