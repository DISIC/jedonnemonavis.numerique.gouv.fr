import { number, string, z } from 'zod';
import { router, publicProcedure } from '@/src/server/trpc';
import { ProductSchema } from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';

export const productRouter = router({
  getById: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/product/{id}' } })
    .input(z.object({ id: z.number() }))
    .output(z.object({ data: ProductSchema }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: {
          id: input.id
        }
      });

      if (!product)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found'
        });

      return { data: product };
    }),
});
