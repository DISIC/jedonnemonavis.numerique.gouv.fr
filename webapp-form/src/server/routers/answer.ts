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
        runtime_mappings: {
          answer_text_with_intention: {
            type: "keyword",
            script:
              "emit(doc['answer_text.keyword'].value + '_' + doc['intention.keyword'].value)",
          },
        },
        aggs: {
          term: {
            terms: {
              field: "answer_text_with_intention",
              size: 1000,
            },
          },
        },
        size: 0,
      });

      const tmpBuckets = fieldCodeAggs?.aggregations?.term
        ?.buckets as any as unknown as Buckets;

      const total = fieldCodeAggs.hits?.total?.value;

      const buckets = tmpBuckets
        .map((bucket) => {
          const [answerText, answerIntention] = bucket.key.split("_");

          return {
            answer_text: answerText,
            intention: answerIntention as AnswerIntention,
            answer_score:
              answerIntention === "good"
                ? 10
                : answerIntention === "medium"
                ? 5
                : 0,
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

      const average = buckets.reduce((acc, curr) => {
        return acc + (curr.answer_score * curr.doc_count) / curr.doc_count;
      }, 0);

      return { data: buckets, metadata: { total, average } };
    }),
});
