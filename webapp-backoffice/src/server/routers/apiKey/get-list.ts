import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { assertApiKeyScopeAccess } from './utils';

export const getApiKeyListInputSchema = z.object({
	product_id: z.number().optional(),
	entity_id: z.number().optional()
});

export const getApiKeyListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getApiKeyListInputSchema>;
}) => {
	await assertApiKeyScopeAccess(ctx, input);

	const keys = await ctx.prisma.apiKey.findMany({
		where: {
			...(input.product_id && { product_id: input.product_id }),
			...(input.entity_id && { entity_id: input.entity_id })
		},
		include: { api_key_logs: true }
	});

	return { count: 0, data: keys };
};
