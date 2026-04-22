import type { PrismaClient } from '@prisma/client';
import { formAlertJobId, formAlertQueue } from '@/src/lib/queue';

export const DEFAULT_MAX_WINDOW_MINUTES = 120;
export const DEBOUNCE_DELAY_MS = 5 * 60 * 1000; // 5 min sliding window

/**
 * Schedules (or reschedules) a debounced alert email for the given form.
 *
 * Sliding window: each new review pushes the soft-fire 5 min into the future.
 * Hard cap: if the oldest pending review on this form is older than the
 * form's `alert_max_window_minutes` (default 120), we fire immediately
 * regardless of further activity.
 *
 * Fire-and-forget: failures are logged but never bubble up to the request
 * that created the review.
 */
export async function onReviewCreated(
	prisma: PrismaClient,
	formId: number
): Promise<void> {
	try {
		const form = await prisma.form.findUnique({
			where: { id: formId },
			select: {
				id: true,
				isDeleted: true,
				alert_max_window_minutes: true,
				last_alert_sent_at: true,
				created_at: true
			}
		});

		if (!form || form.isDeleted) return;

		const cursor = form.last_alert_sent_at ?? form.created_at;

		const oldestPending = await prisma.review.findFirst({
			where: {
				form_id: formId,
				created_at: { gt: cursor }
			},
			orderBy: { created_at: 'asc' },
			select: { created_at: true }
		});

		if (!oldestPending) return;

		const maxWindowMinutes =
			form.alert_max_window_minutes ?? DEFAULT_MAX_WINDOW_MINUTES;
		const elapsedMs = Date.now() - oldestPending.created_at.getTime();
		const hardCapReached = elapsedMs >= maxWindowMinutes * 60 * 1000;

		const jobId = formAlertJobId(formId);
		const delay = hardCapReached ? 0 : DEBOUNCE_DELAY_MS;

		// Reset the sliding window: drop any existing delayed job for this form
		// so the new one with a fresh delay can take its place. `remove` is a
		// no-op when no such job exists.
		await formAlertQueue.remove(jobId);
		await formAlertQueue.add(
			'process',
			{ form_id: formId },
			{ jobId, delay }
		);
	} catch (err) {
		console.error(
			`[alerts] onReviewCreated failed for form ${formId}:`,
			err
		);
	}
}
