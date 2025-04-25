import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { StatusExportSchema, TypeExportSchema } from '@/prisma/generated/zod';

export const reviewCustomRouter = router({
	getList: protectedProcedure
		.input(
			z.object({
				form_id: z.number(),
				numberPerPage: z.number(),
				page: z.number().default(1)
			})
		)
		.query(async ({ ctx, input }) => {
			const { form_id } = input;

			const reviews = await ctx.prisma.reviewCustom.findMany({
				where: {
					form_id
				},
				include: {
					answers: true
				}
			});

			const countReviews = await ctx.prisma.reviewCustom.count({
				where: {
					form_id
				}
			});

			return { data: reviews, metadata: { reviewsCount: countReviews } };
		})
});
