import { router } from "@/src/server/trpc";
import { reviewRouter } from "./review";
import { productRouter } from "./product";
import { answerRouter } from "./answer";

export const appRouter = router({
  review: reviewRouter,
  product: productRouter,
  answer: answerRouter,
});

export type AppRouter = typeof appRouter;
