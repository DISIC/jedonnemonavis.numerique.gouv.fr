import { protectedProcedure, router } from '@/src/server/trpc';
import { getDomainListInputSchema, getDomainListQuery } from './get-list';
import { createDomainInputSchema, createDomainMutation } from './create';
import { deleteDomainInputSchema, deleteDomainMutation } from './delete';

export const domainRouter = router({
	getList: protectedProcedure
		.meta({ isAdmin: true })
		.input(getDomainListInputSchema)
		.query(getDomainListQuery),

	create: protectedProcedure
		.meta({ isAdmin: true })
		.input(createDomainInputSchema)
		.mutation(createDomainMutation),

	delete: protectedProcedure
		.meta({ isAdmin: true })
		.input(deleteDomainInputSchema)
		.mutation(deleteDomainMutation)
});
