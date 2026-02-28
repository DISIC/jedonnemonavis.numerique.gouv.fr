import {
  ButtonSchema,
  FormSchema,
  ProductSchema,
} from "@/prisma/generated/zod";
import type { Context } from "@/src/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const getProductByIdInputSchema = z.object({ id: z.number() });

export const getProductByIdOutputSchema = z.object({
  data: ProductSchema.extend({
    forms: z.array(FormSchema.extend({ buttons: z.array(ButtonSchema) })),
  }),
});

export const getProductByIdQuery = async ({
  ctx,
  input,
}: {
  ctx: Context;
  input: z.infer<typeof getProductByIdInputSchema>;
}) => {
  const product = await ctx.prisma.product.findUnique({
    where: {
      id: input.id,
    },
    include: {
      forms: {
        include: {
          buttons: true,
        },
      },
    },
  });

  if (!product)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Product not found",
    });

  return { data: product };
};
