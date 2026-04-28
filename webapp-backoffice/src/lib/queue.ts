import { Queue } from 'bullmq';
import redis from './redis';

export type ExportJobData = {
	exportId: number;
};

export const exportQueue = new Queue<ExportJobData>('exports', {
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
});
