import { protectedProcedure, router } from '@/src/server/trpc';
import { getCatalogueQuery } from './get-catalogue';
import {
	validateClassificationInputSchema,
	validateClassificationMutation
} from './validate';

export const classificationRouter = router({
	getCatalogue: protectedProcedure.query(getCatalogueQuery),

	validate: protectedProcedure
		.input(validateClassificationInputSchema)
		.mutation(validateClassificationMutation)
});
