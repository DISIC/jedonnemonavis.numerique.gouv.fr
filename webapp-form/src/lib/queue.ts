import { Queue } from 'bullmq';
import redis from './redis';

export type FormAlertJobData = {
	form_id: number;
};

// Producer-side handle for the alert queue. The worker that consumes these
// jobs lives in webapp-backoffice (src/workers/alert-worker.ts) and must
// connect to the same Redis instance.
export const formAlertQueue = new Queue<FormAlertJobData>('form-alerts', {
	connection: redis,
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 5000,
		},
		removeOnComplete: { count: 100 },
		removeOnFail: { count: 100 },
	},
});

export const formAlertJobId = (formId: number) => `form-alert:${formId}`;
