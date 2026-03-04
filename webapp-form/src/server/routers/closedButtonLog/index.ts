import { publicProcedure, router } from "@/src/server/trpc";
import {
  createOrUpdateClosedButtonLogInputSchema,
  createOrUpdateClosedButtonLogMutation,
} from "./create-or-update";

export const closedButtonLogRouter = router({
  createOrUpdate: publicProcedure
    .input(createOrUpdateClosedButtonLogInputSchema)
    .mutation(createOrUpdateClosedButtonLogMutation),
});
