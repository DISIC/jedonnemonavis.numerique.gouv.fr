import { protectedProcedure, publicProcedure, router } from '@/src/server/trpc';
import { getProductByIdInputSchema, getProductByIdQuery } from './get-by-id';
import { getProductListInputSchema, getProductListQuery } from './get-list';
import {
	getProductXWikiIdsInputSchema,
	getProductXWikiIdsOutputSchema,
	getProductXWikiIdsQuery
} from './get-xwiki-ids';
import { createProductInputSchema, createProductMutation } from './create';
import { updateProductInputSchema, updateProductMutation } from './update';
import { archiveProductInputSchema, archiveProductMutation } from './archive';
import { restoreProductInputSchema, restoreProductMutation } from './restore';

export { checkRightToProceed } from './utils';

export const productRouter = router({
	getById: publicProcedure
		.meta({ logEvent: true })
		.input(getProductByIdInputSchema)
		.query(getProductByIdQuery),

	getList: protectedProcedure
		.meta({ logEvent: true })
		.input(getProductListInputSchema)
		.query(getProductListQuery),

	getXWikiIds: publicProcedure
		.meta({ openapi: { method: 'GET', path: '/products/xwiki' } })
		.input(getProductXWikiIdsInputSchema)
		.output(getProductXWikiIdsOutputSchema)
		.query(getProductXWikiIdsQuery),

	create: protectedProcedure
		.input(createProductInputSchema)
		.mutation(createProductMutation),

	update: protectedProcedure
		.meta({ logEvent: true })
		.input(updateProductInputSchema)
		.mutation(updateProductMutation),

	archive: protectedProcedure
		.meta({ logEvent: true })
		.input(archiveProductInputSchema)
		.mutation(archiveProductMutation),

	restore: protectedProcedure
		.meta({ logEvent: true })
		.input(restoreProductInputSchema)
		.mutation(restoreProductMutation)
});
