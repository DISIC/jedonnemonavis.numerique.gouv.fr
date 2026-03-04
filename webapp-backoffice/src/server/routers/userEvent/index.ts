import { protectedProcedure, router } from '@/src/server/trpc';
import {
	getLastReviewViewInputSchema,
	getLastReviewViewQuery
} from './get-last-review-view';
import {
	getLastFormReviewViewInputSchema,
	getLastFormReviewViewQuery
} from './get-last-form-review-view';
import {
	createReviewViewInputSchema,
	createReviewViewMutation
} from './create-review-view';
import { countNewLogsInputSchema, countNewLogsQuery } from './count-new-logs';
import { getEventListInputSchema, getEventListQuery } from './get-list';

export {
	SERVICE_ACTIONS,
	PRODUCT_ACTIONS,
	ORGANISATION_ACTIONS,
	ALL_ACTIONS
} from './constants';

export const userEventRouter = router({
	getLastReviewView: protectedProcedure
		.input(getLastReviewViewInputSchema)
		.query(getLastReviewViewQuery),

	getLastFormReviewView: protectedProcedure
		.input(getLastFormReviewViewInputSchema)
		.query(getLastFormReviewViewQuery),

	createReviewView: protectedProcedure
		.input(createReviewViewInputSchema)
		.mutation(createReviewViewMutation),

	countNewLogs: protectedProcedure
		.input(countNewLogsInputSchema)
		.query(countNewLogsQuery),

	getList: protectedProcedure
		.meta({ logEvent: true })
		.input(getEventListInputSchema)
		.query(getEventListQuery)
});
