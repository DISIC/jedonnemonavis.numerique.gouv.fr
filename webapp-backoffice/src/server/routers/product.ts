import { z } from 'zod';
import { router, publicProcedure } from '@/src/server/trpc';

export const productRouter = router({
	getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
		return ctx.prisma.product.findUnique({
			where: {
				id: input
			}
		});
	})
});
