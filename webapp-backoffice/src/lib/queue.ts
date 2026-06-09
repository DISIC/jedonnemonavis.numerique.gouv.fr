import { Queue } from 'bullmq';
import redis from './redis';

export type ExportJobData = {
	exportId: number;
};

export type FormAlertJobData = {
	formId: number;
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

export const formAlertQueue = new Queue<FormAlertJobData>('form-alerts', {
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

export const exportJobId = (exportId: number) => `export-${exportId}`;
export const formAlertJobId = (formId: number) => `formAlert-${formId}`;
