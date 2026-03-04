import { publicProcedure, router } from "@/src/server/trpc";
import {
  getProductByIdInputSchema,
  getProductByIdOutputSchema,
  getProductByIdQuery,
} from "./get-by-id";

export const productRouter = router({
  getById: publicProcedure
    .meta({ openapi: { method: "GET", path: "/product/{id}" } })
    .input(getProductByIdInputSchema)
    .output(getProductByIdOutputSchema)
    .query(getProductByIdQuery),
});
