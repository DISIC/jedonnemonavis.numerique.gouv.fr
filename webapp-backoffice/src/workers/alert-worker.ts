import { Worker, type Job } from 'bullmq';
import redis from '@/src/lib/redis';
import type { FormAlertJobData } from '@/src/lib/queue';
import { processFormAlertBatch } from '@/src/server/services/alerts/process-batch';

const CONCURRENCY_LIMIT = parseInt(
	process.env.WORKER_ALERT_CONCURRENCY ?? '5',
	10
);

async function processAlertJob(job: Job<FormAlertJobData>): Promise<void> {
	await processFormAlertBatch(job.data.formId);
}

declare const globalThis: {
	_alertWorker?: Worker<FormAlertJobData>;
} & typeof global;

export function startAlertWorker(): void {
	if (globalThis._alertWorker) return;

	if (!redis) {
		console.warn(
			'[alert-worker] REDIS_URL not set — alert worker not started.'
		);
		return;
	}

	const worker = new Worker<FormAlertJobData>('form-alerts', processAlertJob, {
		connection: redis,
		concurrency: CONCURRENCY_LIMIT,
		lockDuration: 60_000,
		stalledInterval: 30_000
	});

	worker.on('completed', job => {
		console.log(
			`[alert-worker] Job ${job.id} completed (form ${job.data.formId})`
		);
	});

	worker.on('failed', (job, err) => {
		console.error(
			`[alert-worker] Job ${job?.id} failed (form ${job?.data.formId}):`,
			err.message
		);
	});

	worker.on('error', err => {
		console.error('[alert-worker] Worker error:', err);
	});

	globalThis._alertWorker = worker;
	console.log(`[alert-worker] Started (concurrency=${CONCURRENCY_LIMIT})`);
}
