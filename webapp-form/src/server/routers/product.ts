import { ProductSchema } from "@/prisma/generated/zod";
import { publicProcedure, router } from "@/src/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const productRouter = router({
  getById: publicProcedure
    .meta({ openapi: { method: "GET", path: "/product/{id}" } })
    .input(z.object({ id: z.number() }))
    .output(z.object({ data: ProductSchema }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: {
          id: input.id,
        },
        include: {
          buttons: true,
        },
      });

      if (!product)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });

      return { data: product };
    }),
});
