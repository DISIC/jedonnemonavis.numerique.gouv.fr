import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { StatusExportSchema } from '@/prisma/generated/zod';

export const exportRouter = router({

	getByUser: protectedProcedure
		.input(
			z.object({
				user_id: z.number(),
				status: z.array(StatusExportSchema).optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { user_id, status } = input;
			const exportCsv = await ctx.prisma.export.findMany({
				where: {
					user_id: user_id,
					...(status && { status: {in: status} }),
				},
			});

			return { data: exportCsv };
		}),

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
