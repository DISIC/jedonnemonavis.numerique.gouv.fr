import { Worker, type Job } from 'bullmq';
import redis from '@/src/lib/redis';
import type { ClassificationJobData } from '@/src/lib/queue';
import { isAlbertConfigured } from '@/src/lib/albert';
import { classifyReview } from '@/src/server/services/classification/classify-review';

const CONCURRENCY_LIMIT = parseInt(
	process.env.WORKER_CLASSIFY_CONCURRENCY ?? '4',
	10
);

// Keep the worker comfortably under the Albert chat quota (prod: 100 req/min). The BullMQ
// limiter throttles the whole worker regardless of concurrency.
const RPM = parseInt(process.env.ALBERT_CLASSIFY_RPM ?? '90', 10);

async function processClassificationJob(
	job: Job<ClassificationJobData>
): Promise<void> {
	await classifyReview(job.data.reviewId, new Date(job.data.reviewCreatedAt));
}

declare const globalThis: {
	_classificationWorker?: Worker<ClassificationJobData>;
} & typeof global;

export function startClassificationWorker(): void {
	if (globalThis._classificationWorker) return;

	if (!redis) {
		console.warn(
			'[classification-worker] REDIS_URL not set — classification worker not started.'
		);
		return;
	}

	if (!isAlbertConfigured()) {
		console.warn(
			'[classification-worker] Albert not configured (ALBERT_API_BASE_URL / ALBERT_API_KEY) — classification worker not started.'
		);
		return;
	}

	const worker = new Worker<ClassificationJobData>(
		'classification',
		processClassificationJob,
		{
			connection: redis,
			concurrency: CONCURRENCY_LIMIT,
			limiter: { max: RPM, duration: 60_000 },
			lockDuration: 60_000,
			stalledInterval: 30_000
		}
	);

	worker.on('failed', (job, err) => {
		console.error(
			`[classification-worker] Job ${job?.id} failed (review ${job?.data.reviewId}):`,
			err.message
		);
	});

	worker.on('error', err => {
		console.error('[classification-worker] Worker error:', err);
	});

	globalThis._classificationWorker = worker;
	console.log(
		`[classification-worker] Started (concurrency=${CONCURRENCY_LIMIT}, limiter=${RPM}/min)`
	);
}
