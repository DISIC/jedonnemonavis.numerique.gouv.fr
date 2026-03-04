import type { Context } from "@/src/server/trpc";
import { z } from "zod";

export const createOrUpdateClosedButtonLogInputSchema = z.object({
  button_id: z.number(),
});

export const createOrUpdateClosedButtonLogMutation = async ({
  ctx,
  input,
}: {
  ctx: Context;
  input: z.infer<typeof createOrUpdateClosedButtonLogInputSchema>;
}) => {
  const { button_id } = input;

  const closedButtonLog = await ctx.prisma.closedButtonLog.upsert({
    where: { button_id },
    update: { count: { increment: 1 } },
    create: { button_id },
  });

  return {
    data: closedButtonLog,
  };
};
