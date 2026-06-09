import { Queue } from 'bullmq';
import redis from './redis';

export type ExportJobData = {
	exportId: number;
};

export type FormAlertJobData = {
	formId: number;
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

// Queues are null when Redis is unavailable (see redis.ts). Producers must guard
// on null before calling .add(); on a Redis-less env this turns enqueuing into a no-op.
export const exportQueue = redis
	? new Queue<ExportJobData>('exports', { connection: redis, defaultJobOptions })
	: null;

export const formAlertQueue = redis
	? new Queue<FormAlertJobData>('form-alerts', {
			connection: redis,
			defaultJobOptions
	  })
	: null;

export const exportJobId = (exportId: number) => `export-${exportId}`;
export const formAlertJobId = (formId: number) => `formAlert-${formId}`;
