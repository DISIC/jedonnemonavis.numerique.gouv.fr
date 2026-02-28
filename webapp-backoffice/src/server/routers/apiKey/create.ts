import type { Context } from '@/src/server/trpc';
import crypto from 'crypto';
import { z } from 'zod';

export const createApiKeyInputSchema = z.object({
	product_id: z.number().optional(),
	entity_id: z.number().optional()
});

export const createApiKeyMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createApiKeyInputSchema>;
}) => {
	const ctx_user = ctx.session.user;

	// Uses cryptographically secure random bytes instead of Math.random().
	const key = crypto.randomBytes(24).toString('hex');

	const newKey = await ctx.prisma.apiKey.create({
		data: {
			user_id: parseInt(ctx_user.id),
			key,
			scope: 'user',
			...(input.product_id && { product_id: input.product_id }),
			...(input.entity_id && { entity_id: input.entity_id })
		}
	});

	return { data: newKey };
};
