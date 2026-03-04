import { protectedProcedure, router } from '@/src/server/trpc';
import {
	getReviewCustomListInputSchema,
	getReviewCustomListQuery
} from './get-list';

export const reviewCustomRouter = router({
	getList: protectedProcedure
		.input(getReviewCustomListInputSchema)
		.query(getReviewCustomListQuery)
});
