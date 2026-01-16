import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { StatusExportSchema, TypeExportSchema } from '@/prisma/generated/zod';

export const exportRouter = router({
	getByUser: protectedProcedure
		.input(
			z.object({
				user_id: z.number(),
				status: z.array(StatusExportSchema).optional(),
				product_id: z.number().optional(),
				form_id: z.number().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { user_id, status, product_id, form_id } = input;
			const exports = await ctx.prisma.export.findMany({
				where: {
					user_id: user_id,
					...(status && { status: { in: status } }),
					...(product_id && { product_id: product_id }),
					...(form_id && { form_id: form_id })
				},
				orderBy: { created_at: 'desc' },
				take: 10,
				include: {
					user: { select: { firstName: true, lastName: true, email: true } }
				}
			});

			return { data: exports };
		}),

	create: protectedProcedure
		.input(
			z.object({
				user_id: z.number(),
				params: z.string(),
				product_id: z.number(),
				form_id: z.number(),
				type: TypeExportSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const exportCsv = await ctx.prisma.export.create({
				data: {
					...input,
					status: 'idle'
				}
			});

			return { data: exportCsv };
		})
});
