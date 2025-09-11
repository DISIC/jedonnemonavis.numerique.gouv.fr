import { z } from 'zod';
import { publicProcedure, router } from '@/src/server/trpc';

export const closedButtonLogRouter = router({
	createOrUpdate: publicProcedure
		.input(
			z.object({
				button_id: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { button_id } = input;

			const closedButtonLog = await ctx.prisma.closedButtonLog.upsert({
				where: { button_id },
				update: { count: { increment: 1 } },
				create: { button_id },
			});

			return {
				data: closedButtonLog,
			};
		}),
});
