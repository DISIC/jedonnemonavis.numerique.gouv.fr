import { z } from "zod";
import { router, publicProcedure } from "@/src/server/trpc";
import { Buckets, ElkAnswer } from "@/src/utils/types";
import { AnswerIntention } from "@prisma/client";

export const answerRouter = router({
  getByFieldCode: publicProcedure
    .meta({ openapi: { method: "GET", path: "/answers/{field_code}" } })
    .input(
      z.object({
        field_code: z.string(),
        product_id: z.string() /* To change to button_id */,
      })
    )
    .output(
      z.object({
        data: z.array(
          z.object({
            answer_text: z.string(),
            intention: z.string(),
            doc_count: z.number(),
          })
        ),
        metadata: z.object({
          total: z.number(),
          average: z.number(),
          fieldLabel: z.string(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const { field_code, product_id } = input;

      const fieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
        index: "jdma-answers",
        query: {
          bool: {
            must: [
              {
                match: {
                  field_code,
                },
              },
              {
                match: {
                  product_id,
                },
              },
            ],
          },
        },
        aggs: {
          term: {
            terms: {
              script:
                'doc["answer_text.keyword"].value + "_" + doc["intention.keyword"].value + "_" + doc["field_label.keyword"].value',
              size: 1000,
            },
          },
        },
        size: 0,
      });

      const tmpBuckets = (fieldCodeAggs?.aggregations?.term as any)
        ?.buckets as Buckets;

      let metadata = {} as {
        total: number;
        average: number;
        fieldLabel: string;
      };

      metadata.total = (fieldCodeAggs.hits?.total as any)?.value;

      const buckets = tmpBuckets
        .map((bucket) => {
          const [answerText, intention, fieldLabel] = bucket.key.split("_");

          if (!metadata.fieldLabel) metadata.fieldLabel = fieldLabel;

          return {
            answer_text: answerText,
            intention: intention as AnswerIntention,
            answer_score:
              intention === "good" ? 10 : intention === "medium" ? 5 : 0,
            doc_count: bucket.doc_count,
          };
        })
        .sort((a, b) => {
          const aIntention = a.intention;
          const bIntention = b.intention;

          if (aIntention === "good") return -1;
          if (bIntention === "good") return 1;
          if (aIntention === "medium") return -1;
          if (bIntention === "medium") return 1;
          if (aIntention === "bad") return -1;
          if (bIntention === "bad") return 1;
          if (aIntention === "neutral") return -1;
          if (bIntention === "neutral") return 1;

          return 0;
        });

      metadata.average = Number(
        (
          buckets.reduce((acc, curr) => {
            return acc + curr.answer_score * curr.doc_count;
          }, 0) / metadata.total
        ).toFixed(1)
      );

      return { data: buckets, metadata };
    }),
});
