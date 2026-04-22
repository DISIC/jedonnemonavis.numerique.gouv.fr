import { protectedProcedure, router } from '@/src/server/trpc';
import {
	getSubscriptionInputSchema,
	getSubscriptionQuery
} from './get-subscription';
import {
	setSubscriptionInputSchema,
	setSubscriptionMutation
} from './set-subscription';

export const formAlertRouter = router({
	getSubscription: protectedProcedure
		.input(getSubscriptionInputSchema)
		.query(getSubscriptionQuery),

	setSubscription: protectedProcedure
		.input(setSubscriptionInputSchema)
		.mutation(setSubscriptionMutation)
});
