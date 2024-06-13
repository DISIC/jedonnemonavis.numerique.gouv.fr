import { z } from "zod";
import { router, publicProcedure } from "@/src/server/trpc";
import { Answer, Prisma, PrismaClient } from "@prisma/client";
import {
  ReviewUncheckedCreateInputSchema,
  AnswerCreateInputSchema,
  ReviewSchema,
} from "@/prisma/generated/zod";
import { Client } from "@elastic/elasticsearch";
import { ElkAnswer } from "@/src/utils/types";

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
      button: true,
    },
  });

  const promises = Promise.all(
    answers.map(async (answer) => {
      return prisma.answer
        .create({
          data: {
            ...answer,
            child_answers: answer.child_answers
              ? {
                  createMany: {
                    data: (
                      answer.child_answers.createMany
                        ?.data as Prisma.AnswerCreateManyParent_answerInput[]
                    ).map((item) => ({
                      ...item,
                      review_id: newReview.id,
                      review_created_at: newReview.created_at,
                    })),
                  },
                }
              : undefined,
            review: {
              connect: {
                id_created_at: {
                  id: newReview.id,
                  created_at: newReview.created_at,
                },
              },
            },
          },
          include: {
            child_answers: true,
          },
        })
        .then((newAnswer) => {
          const {
            id: newAnswerId,
            parent_answer_id: newAnswerParentAnswerId,
            child_answers: newAnswerChildAnswers,
            ...answerForElk
          } = newAnswer;

          return elkClient
            .index<ElkAnswer>({
              index: "jdma-answers",
              id: newAnswerId.toString(),
              body: {
                ...answerForElk,
                review_id: newReview.id,
                button_id: newReview.button_id,
                button_name: newReview.button.title,
                product_id: newReview.product_id,
                product_name: newReview.product.title,
                created_at: newReview.created_at,
              },
            })
            .then(() => {
              return newAnswer;
            });
        });
    })
  );

  await promises.then((responses) => {
    return Promise.all(
      responses
        .map((newAnswer) => {
          const { child_answers: newAnswerChildAnswers } = newAnswer;
          if (newAnswerChildAnswers) {
            return newAnswerChildAnswers.map((item: Answer, index: number) => {
              const { id: childAnswerId, ...childAnswerForElk } = item;
              return elkClient.index<ElkAnswer>({
                index: "jdma-answers",
                id: childAnswerId.toString(),
                body: {
                  ...childAnswerForElk,
                  parent_field_code: newAnswer.field_code,
                  parent_answer_item_id: newAnswer.answer_item_id,
                  review_id: newReview.id,
                  button_id: newReview.button_id,
                  button_name: newReview.button.title,
                  product_id: newReview.product_id,
                  product_name: newReview.product.title,
                  created_at: newReview.created_at,
                },
              });
            });
          }
        })
        .flat()
    );
  });

  return newReview;
}

export const reviewRouter = router({
  create: publicProcedure
    .input(
      z.object({
        review: ReviewUncheckedCreateInputSchema,
        answers: z.array(AnswerCreateInputSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newReview = await createReview(ctx, input);

      return { data: newReview };
    }),
});
