import { protectedProcedure, router } from '@/src/server/trpc';
import { getEntityListInputSchema, getEntityListQuery } from './get-list';
import { getEntityByIdInputSchema, getEntityByIdQuery } from './get-by-id';
import { createEntityInputSchema, createEntityMutation } from './create';
import { updateEntityInputSchema, updateEntityMutation } from './update';
import { deleteEntityInputSchema, deleteEntityMutation } from './delete';

export const entityRouter = router({
	getList: protectedProcedure
		.meta({ logEvent: true })
		.input(getEntityListInputSchema)
		.query(getEntityListQuery),

	getById: protectedProcedure
		.input(getEntityByIdInputSchema)
		.query(getEntityByIdQuery),

	delete: protectedProcedure
		.input(deleteEntityInputSchema)
		.mutation(deleteEntityMutation),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(createEntityInputSchema)
		.mutation(createEntityMutation),

	update: protectedProcedure
		.meta({ logEvent: true })
		.input(updateEntityInputSchema)
		.mutation(updateEntityMutation)
});
