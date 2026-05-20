import type { PrismaClient } from '@prisma/client';
import { formAlertJobId, formAlertQueue } from '@/src/lib/queue';

export const DEFAULT_MAX_WINDOW_MINUTES =
	parseInt(process.env.ALERT_MAX_WINDOW_MINUTES ?? '') || 120;
export const DEBOUNCE_DELAY_MS =
	parseInt(process.env.ALERT_DEBOUNCE_MS ?? '') || 5 * 60 * 1000;

export async function onReviewCreated(
	prisma: PrismaClient,
	formId: number,
): Promise<void> {
	try {
		const form = await prisma.form.findUnique({
			where: { id: formId },
			select: {
				id: true,
				isDeleted: true,
				alert_max_window_minutes: true,
				last_alert_sent_at: true,
				created_at: true,
			},
		});

		if (!form || form.isDeleted) return;

		const hasSubscriber = await prisma.formAlertSubscription.findFirst({
			where: { form_id: formId, enabled: true },
			select: { id: true },
		});
		if (!hasSubscriber) return;

		const cursor = form.last_alert_sent_at ?? form.created_at;

		const oldestPending = await prisma.review.findFirst({
			where: {
				form_id: formId,
				created_at: { gt: cursor },
			},
			orderBy: { created_at: 'asc' },
			select: { created_at: true },
		});

		if (!oldestPending) return;

		const maxWindowMinutes =
			form.alert_max_window_minutes ?? DEFAULT_MAX_WINDOW_MINUTES;
		const elapsedMs = Date.now() - oldestPending.created_at.getTime();
		const hardCapReached = elapsedMs >= maxWindowMinutes * 60 * 1000;

		const jobId = formAlertJobId(formId);
		const delay = hardCapReached ? 0 : DEBOUNCE_DELAY_MS;

		await formAlertQueue.remove(jobId);
		await formAlertQueue.add('process', { formId }, { jobId, delay });
	} catch (err) {
		console.error(`[alerts] onReviewCreated failed for form ${formId}:`, err);
	}
}
