import { protectedProcedure, router } from '@/src/server/trpc';
import {
	getArchivedReviewListInputSchema,
	getArchivedReviewListQuery
} from './get-list';

export const archivedReviewRouter = router({
	getList: protectedProcedure
		.meta({ isAdmin: true })
		.input(getArchivedReviewListInputSchema)
		.query(getArchivedReviewListQuery)
});
