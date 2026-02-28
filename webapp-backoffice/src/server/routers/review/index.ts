import { protectedProcedure, publicProcedure, router } from '@/src/server/trpc';
import {
	getReviewListInputSchema,
	getReviewListOutputSchema,
	getReviewListQuery
} from './get-list';
import {
	countReviewsInputSchema,
	countReviewsOutputSchema,
	countReviewsQuery
} from './count-reviews';
import {
	exportReviewDataInputSchema,
	exportReviewDataMutation
} from './export-data';
import {
	getProgressionExportInputSchema,
	getProgressionExportOutputSchema,
	getProgressionExportQuery
} from './get-progression-export';
import {
	getCountsByFormInputSchema,
	getCountsByFormOutputSchema,
	getCountsByFormQuery
} from './get-counts-by-form';
import {
	createFormReviewViewEventInputSchema,
	createFormReviewViewEventMutation
} from './create-form-review-view-event';

export const reviewRouter = router({
	getList: protectedProcedure
		.input(getReviewListInputSchema)
		.output(getReviewListOutputSchema)
		.query(getReviewListQuery),

	countReviews: publicProcedure
		.input(countReviewsInputSchema)
		.output(countReviewsOutputSchema)
		.query(countReviewsQuery),

	exportData: protectedProcedure
		.input(exportReviewDataInputSchema)
		.mutation(exportReviewDataMutation),

	getProgressionExport: protectedProcedure
		.input(getProgressionExportInputSchema)
		.output(getProgressionExportOutputSchema)
		.query(getProgressionExportQuery),

	getCountsByForm: protectedProcedure
		.input(getCountsByFormInputSchema)
		.output(getCountsByFormOutputSchema)
		.query(getCountsByFormQuery),

	createFormReviewViewEvent: protectedProcedure
		.input(createFormReviewViewEventInputSchema)
		.mutation(createFormReviewViewEventMutation)
});
