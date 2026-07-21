import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { assertAggregatableFieldCode } from './field-codes';
import {
	checkAndGetForm,
	checkAndGetProduct,
	queryCountByFieldCode
} from './utils';

export const countByFieldCodeInputSchema = z.object({
	field_code: z.string(),
	product_id: z.number(),
	form_id: z.number(),
	button_id: z.number().optional(),
	start_date: z.string(),
	end_date: z.string()
});

export const countByFieldCodeQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof countByFieldCodeInputSchema>;
}) => {
	const { product_id, form_id, button_id } = input;

	await checkAndGetProduct({ ctx, product_id });
	const form = await checkAndGetForm({ ctx, form_id });
	await assertAggregatableFieldCode({
		prisma: ctx.prisma,
		form,
		field_code: input.field_code
	});

	const data = await ctx.elkClient.count({
		index: 'jdma-answers',
		query: queryCountByFieldCode({
			...input,
			legacy: !!form?.legacy
		})
	});

	return { data: data.count };
};
