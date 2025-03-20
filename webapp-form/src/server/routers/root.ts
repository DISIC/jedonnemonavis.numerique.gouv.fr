import { router } from "@/src/server/trpc";
import { reviewRouter } from "./review";

export const appRouter = router({
  review: reviewRouter,
});

export type AppRouter = typeof appRouter;
