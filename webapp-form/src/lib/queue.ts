import { Queue } from 'bullmq';
import redis from './redis';

export type FormAlertJobData = {
	formId: number;
};

// Queue is null when Redis is unavailable (see redis.ts). Producers must guard on
// null before calling .add(); on a Redis-less env this turns enqueuing into a no-op.
export const formAlertQueue = redis
	? new Queue<FormAlertJobData>('form-alerts', {
			connection: redis,
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 5000
				},
				removeOnComplete: { count: 100 },
				removeOnFail: { count: 100 }
			}
	  })
	: null;

export const formAlertJobId = (formId: number) => `formAlert-${formId}`;
