import { AnswerCustomUncheckedCreateInputSchema, ButtonSchema, ProductSchema, ReviewCustomUncheckedCreateInputSchema } from "@/prisma/generated/zod";
import { publicProcedure, router } from "@/src/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const createReviewSchema = z.object({
    reviewPayload: ReviewCustomUncheckedCreateInputSchema,
    answersPayload: z.array(
      AnswerCustomUncheckedCreateInputSchema.transform(answer => ({
        ...answer,
        block_id: answer.block_id ?? 0,
        review_id: answer.review_id ?? 0,
      }))
    ),
  });

export const reviewCustomRouter = router({

	create: publicProcedure
		.input(createReviewSchema)
		.mutation(async ({ ctx, input }) => {

            const { reviewPayload, answersPayload } = input

            const review = await ctx.prisma.$transaction(async (prisma) => {
              const createdReview = await prisma.reviewCustom.create({
                data: reviewPayload,
              });
        
              await prisma.answerCustom.createMany({
                data: answersPayload.map(answer => ({
                  ...answer,
                  review_id: createdReview.id,
                })),
              });
        
              return createdReview;
            });
		}),
});
