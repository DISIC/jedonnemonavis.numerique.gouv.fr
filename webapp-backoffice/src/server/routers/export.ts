import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';

export const exportRouter = router({

	create: protectedProcedure
		.input(
            z.object({
                user_id: z.number(),
				params: z.string(),
				product_id: z.number(),
            })
        )
		.mutation(async ({ ctx, input }) => {
			const exportCsv = await ctx.prisma.export.create({
				data: {
                    ...input,
                    status: 'idle', // Ajoute la valeur par défaut du statut
                },
			});

			return { data: exportCsv };
		}),
});
