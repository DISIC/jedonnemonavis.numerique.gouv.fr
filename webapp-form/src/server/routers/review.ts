import { z } from "zod";
import { router, publicProcedure } from "@/src/server/trpc";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  ReviewUncheckedCreateInputSchema,
  AnswerUncheckedCreateInputSchema,
} from "@/prisma/generated/zod";
import { Client } from "@elastic/elasticsearch";

export async function createReview(
  ctx: { prisma: PrismaClient; elkClient: Client },
  input: {
    review: Prisma.ReviewUncheckedCreateInput;
    answers: Prisma.AnswerUncheckedCreateInput[];
  }
) {
  const { prisma, elkClient } = ctx;
  const { review, answers } = input;

  const newReview = await prisma.review.create({
    data: review,
    include: {
      product: true,
      button: true,
    },
  });

  Promise.all([
    answers.forEach(async (answer) => {
      const newAnswer = await prisma.answer.create({
        data: {
          ...answer,
          review_id: newReview.id,
        },
      });

      const { id: newAnswerId, ...answerWithoutId } = newAnswer;

      await elkClient.index({
        index: "jdma-answers",
        id: newAnswerId.toString(),
        body: {
          ...answerWithoutId,
          review_id: newReview.id,
          button_id: newReview.button_id,
          button_name: newReview.button.title,
          product_id: newReview.product_id,
          product_name: newReview.product.title,
          created_at: newReview.created_at,
        },
      });
    }),
  ]);

  return newReview;
}

export const reviewRouter = router({
  create: publicProcedure
    .input(
      z.object({
        review: ReviewUncheckedCreateInputSchema,
        answers: z.array(AnswerUncheckedCreateInputSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newReview = await createReview(ctx, input);

      return { data: newReview };
    }),
});
