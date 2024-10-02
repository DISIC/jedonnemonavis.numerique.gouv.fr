import { router } from "@/src/server/trpc";
import { reviewRouter } from "./review";
import { reviewCustomRouter } from "./reviewCustom";

export const appRouter = router({
  review: reviewRouter,
  reviewCustom: reviewCustomRouter
});

export type AppRouter = typeof appRouter;
