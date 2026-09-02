import { protectedProcedure, router } from '@/src/server/trpc';
import { getExportListInputSchema, getExportListQuery } from './get-list';
import { createExportInputSchema, createExportMutation } from './create';
import {
	getExportDownloadLinkInputSchema,
	getExportDownloadLinkMutation
} from './get-download-link';

export const exportRouter = router({
	getList: protectedProcedure
		.input(getExportListInputSchema)
		.query(getExportListQuery),

	getDownloadLink: protectedProcedure
		.input(getExportDownloadLinkInputSchema)
		.mutation(getExportDownloadLinkMutation),

	create: protectedProcedure
		.input(createExportInputSchema)
		.mutation(createExportMutation)
});
