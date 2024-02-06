import { z } from 'zod';
import { router, publicProcedure } from '@/src/server/trpc';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  ReviewUncheckedCreateInputSchema,
  AnswerCreateInputSchema,
  ReviewSchema
} from '@/prisma/generated/zod';
import { Client } from '@elastic/elasticsearch';
import { ElkAnswer } from '@/src/utils/types';

export async function createReview(
  ctx: { prisma: PrismaClient; elkClient: Client },
  input: {
    review: Prisma.ReviewUncheckedCreateInput;
    answers: Prisma.AnswerCreateInput[];
  }
) {
  const { prisma, elkClient } = ctx;
  const { review, answers } = input;

  const newReview = await prisma.review.create({
    data: review,
    include: {
      product: true,
      button: true
    }
  });

  Promise.all([
    answers.forEach(async answer => {
      const newAnswer = await prisma.answer.create({
        data: {
          ...answer,
          review: {
            connect: {
              id: newReview.id
            }
          }
        }
      });

      const { id: newAnswerId, ...answerWithoutId } = newAnswer;

      await elkClient.index<ElkAnswer>({
        index: 'jdma-answers',
        id: newAnswerId.toString(),
        body: {
          ...answerWithoutId,
          review_id: newReview.id,
          button_id: newReview.button_id,
          button_name: newReview.button.title,
          product_id: newReview.product_id,
          product_name: newReview.product.title,
          created_at: newReview.created_at
        }
      });
    })
  ]);

  return newReview;
}

export const reviewRouter = router({
  create: publicProcedure
    .input(
      z.object({
        review: ReviewUncheckedCreateInputSchema,
        answers: z.array(AnswerCreateInputSchema)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newReview = await createReview(ctx, input);

      return { data: newReview };
    }),
});
