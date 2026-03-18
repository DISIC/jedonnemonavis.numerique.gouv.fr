import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { ALL_ACTIONS } from './constants';

export const countNewLogsInputSchema = z.object({
	user_id: z.number().optional(),
	product_id: z.number()
});

export const countNewLogsQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof countNewLogsInputSchema>;
}) => {
	const { product_id, user_id } = input;

	const lastSeenLogs = await ctx.prisma.userEvent.findFirst({
		where: {
			product_id,
			user_id,
			action: 'service_logs_view'
		},
		orderBy: {
			created_at: 'desc'
		}
	});

	const countNewLogs = await ctx.prisma.userEvent.count({
		where: {
			product_id,
			...(lastSeenLogs && {
				created_at: {
					gte: lastSeenLogs?.created_at
				}
			}),
			action: {
				in: ALL_ACTIONS
			}
		}
	});

	return {
		count: countNewLogs
	};
};
