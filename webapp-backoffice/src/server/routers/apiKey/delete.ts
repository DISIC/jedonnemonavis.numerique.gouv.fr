import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const deleteApiKeyInputSchema = z.object({
	key: z.string(),
	product_id: z.number().optional()
});

export const deleteApiKeyMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteApiKeyInputSchema>;
}) => {
	const ctx_user = ctx.session.user;
	const { key, product_id } = input;

	const keyFound = await ctx.prisma.apiKey.findFirst({
		where: {
			key,
			...(product_id && { product_id })
		},
		include: { user: true }
	});

	if (keyFound && keyFound.user.id === parseInt(ctx_user.id)) {
		await ctx.prisma.apiKey.delete({ where: { id: keyFound.id } });
		return { result: 'key deleted' };
	}

	return { result: 'key not found' };
};
