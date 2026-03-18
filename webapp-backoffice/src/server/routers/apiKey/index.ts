import { protectedProcedure, router } from '@/src/server/trpc';
import { getApiKeyListInputSchema, getApiKeyListQuery } from './get-list';
import { createApiKeyInputSchema, createApiKeyMutation } from './create';
import { deleteApiKeyInputSchema, deleteApiKeyMutation } from './delete';

export const apiKeyRouter = router({
	getList: protectedProcedure
		.input(getApiKeyListInputSchema)
		.query(getApiKeyListQuery),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(createApiKeyInputSchema)
		.mutation(createApiKeyMutation),

	delete: protectedProcedure
		.meta({ logEvent: true })
		.input(deleteApiKeyInputSchema)
		.mutation(deleteApiKeyMutation)
});
