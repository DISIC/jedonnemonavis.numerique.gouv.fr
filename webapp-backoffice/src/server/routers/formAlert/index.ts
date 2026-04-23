import { protectedProcedure, router } from '@/src/server/trpc';
import {
	getSubscriptionInputSchema,
	getSubscriptionQuery
} from './get-subscription';
import { getMySubscriptionsQuery } from './get-my-subscriptions';
import {
	setSubscriptionInputSchema,
	setSubscriptionMutation
} from './set-subscription';
import {
	setSubscriptionsForProductInputSchema,
	setSubscriptionsForProductMutation
} from './set-subscriptions-for-product';

export const formAlertRouter = router({
	getSubscription: protectedProcedure
		.input(getSubscriptionInputSchema)
		.query(getSubscriptionQuery),

	getMySubscriptions: protectedProcedure.query(getMySubscriptionsQuery),

	setSubscription: protectedProcedure
		.input(setSubscriptionInputSchema)
		.mutation(setSubscriptionMutation),

	setSubscriptionsForProduct: protectedProcedure
		.input(setSubscriptionsForProductInputSchema)
		.mutation(setSubscriptionsForProductMutation)
});
