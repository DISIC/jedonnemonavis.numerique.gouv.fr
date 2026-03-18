import { protectedProcedure, router } from '@/src/server/trpc';
import {
	createReviewViewLogInputSchema,
	createReviewViewLogMutation
} from './create';

export const reviewViewLogRouter = router({
	create: protectedProcedure
		.input(createReviewViewLogInputSchema)
		.mutation(createReviewViewLogMutation)
});
