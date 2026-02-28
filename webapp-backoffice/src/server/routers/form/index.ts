import { protectedProcedure, publicProcedure, router } from '@/src/server/trpc';
import { getFormByIdInputSchema, getFormByIdQuery } from './get-by-id';
import {
	getFormTemplateBySlugInputSchema,
	getFormTemplateBySlugQuery
} from './get-form-template-by-slug';
import { createFormInputSchema, createFormMutation } from './create';
import { updateFormInputSchema, updateFormMutation } from './update';
import { deleteFormInputSchema, deleteFormMutation } from './delete';

export const formRouter = router({
	getById: protectedProcedure
		.input(getFormByIdInputSchema)
		.query(getFormByIdQuery),

	getFormTemplateBySlug: publicProcedure
		.input(getFormTemplateBySlugInputSchema)
		.query(getFormTemplateBySlugQuery),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(createFormInputSchema)
		.mutation(createFormMutation),

	update: protectedProcedure
		.meta({ logEvent: true })
		.input(updateFormInputSchema)
		.mutation(updateFormMutation),

	delete: protectedProcedure
		.meta({ logEvent: true })
		.input(deleteFormInputSchema)
		.mutation(deleteFormMutation)
});
