import { z } from "zod";
import { router, publicProcedure, limitedProcedure } from "@/src/server/trpc";
import { Answer, Prisma, PrismaClient } from "@prisma/client";
import {
  ReviewUncheckedCreateInputSchema,
  AnswerCreateInputSchema,
} from "@/prisma/generated/zod";
import { Client } from "@elastic/elasticsearch";
import { ElkAnswer } from "@/src/utils/types";
import { ReviewWithButtonAndProduct } from "@/prisma/augmented";
import { TRPCError } from "@trpc/server";
import { FormStepNames } from "@/src/pages/[id]";

export async function createOrUpdateAnswers(
  ctx: { prisma: PrismaClient; elkClient: Client },
  input: {
    answers: Prisma.AnswerCreateInput[];
    review: ReviewWithButtonAndProduct;
    step_name?: FormStepNames;
  }
) {
  const { prisma, elkClient } = ctx;
  const { review, answers, step_name } = input;

  if (step_name && step_name === "contact") {
    await prisma.answer.deleteMany({
      where: {
        review_id: review.id,
        field_code: {
          startsWith: "contact_",
        },
      },
    });

    await elkClient.deleteByQuery({
      index: "jdma-answers",
      body: {
        query: {
          bool: {
            filter: [
              { term: { review_id: review.id } },
              { prefix: { field_code: "contact_" } },
            ],
          },
        },
      },
    });
  }

  const promises = Promise.all(
    answers.map(async (answer) => {
      const existingAnswer = await prisma.answer.findFirst({
        where: {
          review_id: review.id,
          field_code: answer.field_code,
          answer_item_id:
            step_name && step_name === "contact"
              ? answer.answer_item_id
              : undefined,
        },
      });

      if (answer.field_code === "verbatim") {
        await prisma.review.update({
          where: {
            id_created_at: { id: review.id, created_at: review.created_at },
          },
          data: {
            has_verbatim: true,
          },
        });
      }

      const formatAnswer = {
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
                    review_id: review.id,
                    review_created_at: review.created_at,
                  })),
                },
              }
            : undefined,
          review: {
            connect: {
              id_created_at: {
                id: review.id,
                created_at: review.created_at,
              },
            },
          },
        },
        include: {
          child_answers: true,
        },
      };

      return (
        existingAnswer
          ? prisma.answer.update({
              where: {
                id_created_at: {
                  id: existingAnswer.id,
                  created_at: existingAnswer.created_at,
                },
              },
              ...formatAnswer,
            })
          : prisma.answer.create(formatAnswer)
      ).then((newAnswer) => {
        const {
          id: newAnswerId,
          parent_answer_id: newAnswerParentAnswerId,
          child_answers: newAnswerChildAnswers,
          ...answerForElk
        } = newAnswer;

        if (!review.user_id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Review user_id is missing",
          });
        }

        const answerElkBody = {
          ...answerForElk,
          review_id: review.id,
          review_user_id: review.user_id,
          button_id: review.button_id,
          button_name: review.button.title,
          product_id: review.product_id,
          product_name: review.product.title,
          form_id: review.form_id,
          created_at: review.created_at,
        };

        const answerElk = {
          index: "jdma-answers",
          id: newAnswerId.toString(),
          body: existingAnswer ? { doc: answerElkBody } : answerElkBody,
        };

        return (
          existingAnswer
            ? elkClient.update<ElkAnswer>(answerElk)
            : elkClient.index<ElkAnswer>(answerElk)
        ).then(() => {
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
            return newAnswerChildAnswers.map((item: Answer) => {
              const { id: childAnswerId, ...childAnswerForElk } = item;
              return elkClient.index<ElkAnswer>({
                index: "jdma-answers",
                id: childAnswerId.toString(),
                body: {
                  ...childAnswerForElk,
                  parent_field_code: newAnswer.field_code,
                  parent_answer_item_id: newAnswer.answer_item_id,
                  review_id: review.id,
                  button_id: review.button_id,
                  button_name: review.button.title,
                  product_id: review.product_id,
                  form_id: review.form_id,
                  product_name: review.product.title,
                  created_at: review.created_at,
                },
              });
            });
          }
        })
        .flat()
    );
  });
}

export async function createReview(
  ctx: { prisma: PrismaClient; elkClient: Client },
  input: {
    review: Prisma.ReviewUncheckedCreateInput;
    answers: Prisma.AnswerCreateInput[];
  }
) {
  const { prisma } = ctx;
  const { review, answers } = input;

  const newReview = await prisma.review.create({
    data: review,
    include: {
      product: true,
      button: true,
    },
  });

  try {
    await createOrUpdateAnswers(ctx, { answers, review: newReview });
  } catch (e) {
    console.log(e);
  }

  return newReview;
}

export const reviewRouter = router({
  create: limitedProcedure
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

  insertOrUpdate: publicProcedure
    .input(
      z.object({
        answers: z.array(AnswerCreateInputSchema),
        user_id: z.string(),
        product_id: z.number(),
        button_id: z.number(),
        step_name: z.enum([
          "satisfaction",
          "comprehension",
          "verbatim",
          "contact",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user_id, product_id, button_id, answers, step_name } = input;
      const { prisma } = ctx;

      const existingReview = await prisma.review.findFirst({
        where: {
          product_id,
          button_id,
          user_id,
          created_at: {
            gte: new Date(Date.now() - 60 * 60 * 1000),
          },
        },
        include: {
          button: true,
          product: true,
        },
      });

      if (existingReview) {
        await createOrUpdateAnswers(ctx, {
          answers: answers,
          review: existingReview,
          step_name,
        });

        return { data: existingReview };
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }
    }),
});
