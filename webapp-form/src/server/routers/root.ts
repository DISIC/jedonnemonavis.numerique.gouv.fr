import { router } from "@/src/server/trpc";
import { reviewRouter } from "./review";
import { productRouter } from "./product";

export const appRouter = router({
  review: reviewRouter,
  product: productRouter,
});

export type AppRouter = typeof appRouter;
