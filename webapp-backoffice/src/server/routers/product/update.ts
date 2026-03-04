import { ProductUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { normalizeString } from '@/src/utils/tools';
import { z } from 'zod';
import { checkRightToProceed } from './utils';

export const updateProductInputSchema = z.object({
	id: z.number(),
	product: ProductUncheckedUpdateInputSchema
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

	product.title_formatted = normalizeString(product.title as string);

	const updatedProduct = await ctx.prisma.product.update({
		where: { id },
		data: {
			...product
		}
	});

	return { data: updatedProduct };
};
