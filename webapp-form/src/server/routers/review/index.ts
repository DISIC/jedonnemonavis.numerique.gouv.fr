import { limitedProcedure, publicProcedure, router } from "@/src/server/trpc";
import { createReviewInputSchema, createReviewMutation } from "./create";
import {
  dynamicCreateReviewInputSchema,
  dynamicCreateReviewMutation,
} from "./dynamic-create";
import {
  dynamicInsertOrUpdateReviewInputSchema,
  dynamicInsertOrUpdateReviewMutation,
} from "./dynamic-insert-or-update";
import {
  insertOrUpdateReviewInputSchema,
  insertOrUpdateReviewMutation,
} from "./insert-or-update";

export { createOrUpdateAnswers, createReview } from "./utils";

export const reviewRouter = router({
  create: limitedProcedure
    .input(createReviewInputSchema)
    .mutation(createReviewMutation),

  insertOrUpdate: publicProcedure
    .input(insertOrUpdateReviewInputSchema)
    .mutation(insertOrUpdateReviewMutation),

  dynamicCreate: limitedProcedure
    .input(dynamicCreateReviewInputSchema)
    .mutation(dynamicCreateReviewMutation),

  dynamicInsertOrUpdate: publicProcedure
    .input(dynamicInsertOrUpdateReviewInputSchema)
    .mutation(dynamicInsertOrUpdateReviewMutation),
});
