import { protectedProcedure, router } from '@/src/server/trpc';
import { getExportListInputSchema, getExportListQuery } from './get-list';
import { createExportInputSchema, createExportMutation } from './create';

export const exportRouter = router({
	getList: protectedProcedure
		.input(getExportListInputSchema)
		.query(getExportListQuery),

	create: protectedProcedure
		.input(createExportInputSchema)
		.mutation(createExportMutation)
});
