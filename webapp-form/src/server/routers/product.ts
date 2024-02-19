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

      console.log(product)

      if (!product)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found'
        });

      return { data: product };
    }),

  getXWikiIds: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/products/xwiki' } })
    .input(
      z.object({
        numberPerPage: z.number(),
        page: z.number().default(1)
      })
    )
    .output(
      z.object({
        data: z.array(
          z.object({
            id: z.number(),
            xwiki_id: z.number().nullable(),
            buttons: z.array(
              z.object({
                id: z.number()
              })
            )
          })
        ),
        metadata: z.object({ count: z.number() })
      })
    )
    .query(async ({ ctx, input }) => {
      const { numberPerPage, page } = input;

      const products = await ctx.prisma.product.findMany({
        take: numberPerPage,
        skip: numberPerPage * (page - 1),
        include: {
          buttons: true
        }
      });

      const count = await ctx.prisma.product.count();

      return {
        data: products.map(product => ({
          id: product.id,
          xwiki_id: product.xwiki_id,
          buttons: product.buttons.map(b => ({ id: b.id }))
        })),
        metadata: { count }
      };
    })
});
