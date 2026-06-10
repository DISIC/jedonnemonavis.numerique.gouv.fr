import { Queue } from 'bullmq';
import redis from './redis';

export type FormAlertJobData = {
	formId: number;
};

export type ClassificationJobData = {
	reviewId: number;
	reviewCreatedAt: string; // ISO string (Review has a composite [id, created_at] key)
};

const defaultJobOptions = {
	attempts: 3,
	backoff: {
		type: 'exponential' as const,
		delay: 5000
	},
	removeOnComplete: { count: 100 },
	removeOnFail: { count: 100 }
};

// Queues are null when Redis is unavailable (see redis.ts). Producers must guard on
// null before calling .add(); on a Redis-less env this turns enqueuing into a no-op.
export const formAlertQueue = redis
	? new Queue<FormAlertJobData>('form-alerts', {
			connection: redis,
			defaultJobOptions
	  })
	: null;

export const classificationQueue = redis
	? new Queue<ClassificationJobData>('classification', {
			connection: redis,
			defaultJobOptions
	  })
	: null;

export const formAlertJobId = (formId: number) => `formAlert-${formId}`;
export const classificationJobId = (reviewId: number) =>
	`classification-${reviewId}`;
