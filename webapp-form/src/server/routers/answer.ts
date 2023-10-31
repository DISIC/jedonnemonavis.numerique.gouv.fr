import { BucketsInside } from "./../../utils/types";
import { z } from "zod";
import { router, publicProcedure } from "@/src/server/trpc";
import { Buckets, ElkAnswer } from "@/src/utils/types";
import { Answer, AnswerIntention } from "@prisma/client";
import { AnswerIntentionSchema } from "@/prisma/generated/zod";

export const answerRouter = router({
  getByFieldCode: publicProcedure
    .meta({ openapi: { method: "GET", path: "/answers/{field_code}" } })
    .input(
      z.object({
        field_code: z.string(),
        product_id: z.string() /* To change to button_id */,
        start_date: z.string(),
        end_date: z.string(),
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
      const { field_code, product_id, start_date, end_date } = input;

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
              {
                range: {
                  created_at: {
                    gte: start_date,
                    lte: end_date,
                  },
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

  getByFieldCodeInterval: publicProcedure
    .meta({
      openapi: { method: "GET", path: "/answers/interval/{field_code}" },
    })
    .input(
      z.object({
        field_code: z.string(),
        product_id: z.string() /* To change to button_id */,
        start_date: z.string(),
        end_date: z.string(),
      })
    )
    .output(
      z.object({
        data: z.record(
          z.string(),
          z.array(
            z.object({
              answer_text: z.string(),
              intention: z.string(),
              doc_count: z.number(),
            })
          )
        ),
        metadata: z.object({
          total: z.number(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const { field_code, product_id, start_date, end_date } = input;

      const fieldCodeIntervalAggs = await ctx.elkClient.search<ElkAnswer[]>({
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
              {
                range: {
                  created_at: {
                    gte: start_date,
                    lte: end_date,
                  },
                },
              },
            ],
          },
        },
        aggs: {
          count_per_month: {
            date_histogram: {
              field: "created_at",
              calendar_interval: "month",
              format: "yyyy-MM-dd",
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
          },
        },
        size: 0,
      });

      const tmpBuckets = (
        fieldCodeIntervalAggs?.aggregations?.count_per_month as any
      )?.buckets as BucketsInside;

      let metadata = { total: 0 } as { total: number };

      let returnValue: Record<
        string,
        Array<{
          answer_text: string;
          intention: AnswerIntention;
          doc_count: number;
        }>
      > = {};

      tmpBuckets.forEach((bucketInterval) => {
        if (!returnValue[bucketInterval.key_as_string])
          returnValue[bucketInterval.key_as_string] = [];

        bucketInterval.term.buckets.forEach((bucket) => {
          const [answerText, intention] = bucket.key.split("_");

          metadata.total += bucket.doc_count;

          returnValue[bucketInterval.key_as_string].push({
            answer_text: answerText,
            intention: intention as AnswerIntention,
            doc_count: bucket.doc_count,
          });
        });
      });

      return { data: returnValue, metadata };
    }),

  getByFieldCodeIntervalAverage: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/answers/interval/average/{field_code}",
      },
    })
    .input(
      z.object({
        field_code: z.string(),
        product_id: z.string() /* To change to button_id */,
        start_date: z.string(),
        end_date: z.string(),
      })
    )
    .output(
      z.object({
        data: z.record(z.string(), z.number()),
        metadata: z.object({
          total: z.number(),
          average: z.number(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const { field_code, product_id, start_date, end_date } = input;

      const fieldCodeIntervalAggs = await ctx.elkClient.search<ElkAnswer[]>({
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
              {
                range: {
                  created_at: {
                    gte: start_date,
                    lte: end_date,
                  },
                },
              },
            ],
          },
        },
        aggs: {
          count_per_month: {
            date_histogram: {
              field: "created_at",
              calendar_interval: "month",
              format: "MM/yy",
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
          },
        },
        size: 0,
      });

      const tmpBuckets = (
        fieldCodeIntervalAggs?.aggregations?.count_per_month as any
      )?.buckets as BucketsInside;

      let metadata = { total: 0, average: 0 } as {
        total: number;
        average: number;
      };

      let returnValue: Record<string, number> = {};
      let bucketsAverage: number[] = [];

      tmpBuckets.forEach((bucketInterval) => {
        let currentBucketMark = 0;
        let currentBucketTotal = 0;

        bucketInterval.term.buckets.forEach((bucket) => {
          const [_, intention] = bucket.key.split("_");

          metadata.total += bucket.doc_count;

          currentBucketTotal += bucket.doc_count;
          currentBucketMark +=
            bucket.doc_count *
            (intention === "good" ? 10 : intention === "medium" ? 5 : 0);
        });

        let currentBucketAverage =
          Number((currentBucketMark / currentBucketTotal).toFixed(1)) || 0;
        bucketsAverage.push(currentBucketAverage);
        returnValue[bucketInterval.key_as_string] = currentBucketAverage;
      });

      metadata.average = Number(
        (
          bucketsAverage.reduce((acc, curr) => {
            return acc + curr;
          }, 0) / bucketsAverage.length
        ).toFixed(1)
      );

      return { data: returnValue, metadata };
    }),
});
