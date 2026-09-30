import type { Context } from '@/src/server/trpc';
import { normalizeString } from '@/src/utils/tools';
import { z } from 'zod';
import { checkRightToProceed } from './utils';
import { productEditableFieldsSchema } from './create';

export const updateProductInputSchema = z.object({
	id: z.number(),
	product: productEditableFieldsSchema.partial()
});

export const updateProductMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateProductInputSchema>;
}) => {
	const { id, product } = input;

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id: id
	});

	const updatedProduct = await ctx.prisma.product.update({
		where: { id },
		data: {
			title: product.title,
			title_formatted:
				product.title !== undefined
					? normalizeString(product.title)
					: undefined,
			entity_id: product.entity_id,
			urls: product.urls,
			volume: product.volume,
			isPublic: product.isPublic
		}
	});

	return { data: updatedProduct };
};
