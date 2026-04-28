import { ReviewUncheckedCreateInputSchema } from "@/prisma/generated/zod";
import type { Context } from "@/src/server/trpc";
import { z } from "zod";
import { createOrUpdateAnswers, formatDynamicAnswer } from "./utils";
import { onReviewCreated } from "@/src/server/services/alerts/on-review-created";

export const dynamicCreateReviewInputSchema = z.object({
  review: ReviewUncheckedCreateInputSchema,
  answers: z.array(
    z.object({
      block_id: z.number(),
      answer_item_id: z.number().optional(),
      answer_text: z.string().optional(),
    }),
  ),
});

export const dynamicCreateReviewMutation = async ({
  ctx,
  input,
}: {
  ctx: Context;
  input: z.infer<typeof dynamicCreateReviewInputSchema>;
}) => {
  const { prisma } = ctx;
  const { review, answers } = input;

  const newReview = await prisma.review.create({
    data: review,
    include: {
      product: true,
      button: true,
    },
  });

  const formattedAnswers = await Promise.all(
    answers.map((answer) => formatDynamicAnswer(prisma, answer)),
  );

  try {
    await createOrUpdateAnswers(ctx, {
      answers: formattedAnswers,
      review: newReview,
    });
  } catch (e) {
    console.log(e);
  }

  void onReviewCreated(prisma, newReview.form_id);

  return { data: newReview };
};
