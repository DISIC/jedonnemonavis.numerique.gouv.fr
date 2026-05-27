import { protectedProcedure, router } from '@/src/server/trpc';
import {
	getSubscriptionInputSchema,
	getSubscriptionQuery
} from './get-subscription';
import {
	getMySubscriptionsInputSchema,
	getMySubscriptionsQuery
} from './get-my-subscriptions';
import { getActiveSubscriptionGroupsQuery } from './get-active-subscriptions';
import {
	getAlertEmailPreviewInputSchema,
	getAlertEmailPreviewQuery
} from './get-alert-email-preview';
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

	getMySubscriptions: protectedProcedure
		.input(getMySubscriptionsInputSchema)
		.query(getMySubscriptionsQuery),

	getActiveSubscriptionGroups: protectedProcedure.query(
		getActiveSubscriptionGroupsQuery
	),

	getAlertEmailPreview: protectedProcedure
		.input(getAlertEmailPreviewInputSchema)
		.query(getAlertEmailPreviewQuery),

	setSubscription: protectedProcedure
		.input(setSubscriptionInputSchema)
		.mutation(setSubscriptionMutation),

	setSubscriptionsForProduct: protectedProcedure
		.input(setSubscriptionsForProductInputSchema)
		.mutation(setSubscriptionsForProductMutation)
});
