import { protectedProcedure, publicProcedure, router } from '@/src/server/trpc';
import { getButtonListInputSchema, getButtonListQuery } from './get-list';
import { getButtonByIdInputSchema, getButtonByIdQuery } from './get-by-id';
import { createButtonInputSchema, createButtonMutation } from './create';
import { updateButtonInputSchema, updateButtonMutation } from './update';
import { deleteButtonInputSchema, deleteButtonMutation } from './delete';

export const buttonRouter = router({
	getList: publicProcedure
		.input(getButtonListInputSchema)
		.query(getButtonListQuery),

	getById: publicProcedure
		.input(getButtonByIdInputSchema)
		.query(getButtonByIdQuery),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(createButtonInputSchema)
		.mutation(createButtonMutation),

	update: protectedProcedure
		.meta({ logEvent: true })
		.input(updateButtonInputSchema)
		.mutation(updateButtonMutation),

	delete: protectedProcedure
		.meta({ logEvent: true })
		.input(deleteButtonInputSchema)
		.mutation(deleteButtonMutation)
});
