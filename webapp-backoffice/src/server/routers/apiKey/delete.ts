import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
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
	const ctx_user = ctx.session!.user;
	const { key, product_id } = input;

	const keyFound = await ctx.prisma.apiKey.findFirst({
		where: {
			key,
			...(product_id && { product_id })
		},
		include: { user: true }
	});

	if (!keyFound) {
		return { result: 'key not found' };
	}

	const isOwner = keyFound.user.id === parseInt(ctx_user.id);

	if (!isOwner && !ctx_user.role.includes('admin')) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Your are not authorized'
		});
	}

	await ctx.prisma.apiKey.delete({ where: { id: keyFound.id } });

	return { result: 'key deleted' };
};
