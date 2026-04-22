/**
 * Phase 6 will implement the full batch processor (load form, count reviews,
 * resolve subscribers, render + send emails, log UserEvents, advance
 * Form.last_alert_sent_at). For Phase 5 the queue/worker shell calls this
 * placeholder so the wiring is in place.
 */
export async function processFormAlertBatch(formId: number): Promise<void> {
	console.log(`[alerts] processFormAlertBatch called for form ${formId} (Phase 6 stub)`);
}
