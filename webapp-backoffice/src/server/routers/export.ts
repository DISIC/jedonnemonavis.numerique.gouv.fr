import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { StatusExportSchema, TypeExportSchema } from '@/prisma/generated/zod';
import { checkRightToProceed } from './product';

export const exportRouter = router({
	getList: protectedProcedure
		.input(
			z.object({
				status: z.array(StatusExportSchema).optional(),
				product_id: z.number(),
				form_id: z.number()
			})
		)
		.query(async ({ ctx, input }) => {
			const { status, product_id, form_id } = input;

			await checkRightToProceed({
				prisma: ctx.prisma,
				session: ctx.session,
				product_id: product_id
			});

			const exports = await ctx.prisma.export.findMany({
				where: {
					...(status && { status: { in: status } }),
					product_id: product_id,
					form_id: form_id
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
			await checkRightToProceed({
				prisma: ctx.prisma,
				session: ctx.session,
				product_id: input.product_id
			});

			const exportCsv = await ctx.prisma.export.create({
				data: {
					...input,
					status: 'idle'
				}
			});

			return { data: exportCsv };
		})
});
