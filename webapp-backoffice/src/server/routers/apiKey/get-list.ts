import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

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
	const ctx_user = ctx.session!.user;

	if (input.product_id && !ctx_user.role.includes('admin')) {
		const accessRight = await ctx.prisma.accessRight.findFirst({
			where: {
				user_email: ctx.user_api?.email,
				product_id: input.product_id
			}
		});
		if (!accessRight) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Your are not authorized'
			});
		}
	}

	if (input.entity_id && !ctx_user.role.includes('admin')) {
		const adminEntityRights = await ctx.prisma.adminEntityRight.findFirst({
			where: {
				user_email: ctx.user_api?.email,
				entity_id: input.entity_id
			}
		});
		if (!adminEntityRights) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Your are not authorized'
			});
		}
	}

	const keys = await ctx.prisma.apiKey.findMany({
		where: {
			...(input.product_id && { product_id: input.product_id }),
			...(input.entity_id && { entity_id: input.entity_id })
		},
		include: { api_key_logs: true }
	});

	return { count: 0, data: keys };
};
