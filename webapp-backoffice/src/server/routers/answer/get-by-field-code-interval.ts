import type { Context } from '@/src/server/trpc';
import {
	getCalendarFormat,
	getCalendarInterval,
	getDiffDaysBetweenTwoDates
} from '@/src/utils/tools';
import { AnswerIntention } from '@prisma/client';
import { z } from 'zod';
import { BucketsInside, ElkAnswer } from '../../../types/custom';
import {
	checkAndGetForm,
	checkAndGetProduct,
	getDefaultValues,
	queryCountByFieldCode
} from './utils';

export const getByFieldCodeIntervalInputSchema = z.object({
	field_code: z.string(),
	product_id: z.number(),
	form_id: z.number(),
	button_id: z.number().optional(),
	start_date: z.string(),
	end_date: z.string()
});

export const getByFieldCodeIntervalQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getByFieldCodeIntervalInputSchema>;
}) => {
	const { product_id, form_id, start_date, end_date } = input;

	await checkAndGetProduct({ ctx, product_id });
	const form = await checkAndGetForm({ ctx, form_id });

	const nbDays = getDiffDaysBetweenTwoDates(start_date, end_date);

	const fieldCodeIntervalAggs = await ctx.elkClient.search<ElkAnswer[]>({
		index: 'jdma-answers',
		track_total_hits: true,
		query: queryCountByFieldCode({
			...input,
			legacy: form.legacy
		}),
		aggs: {
			count_per_month: {
				date_histogram: {
					field: 'created_at',
					calendar_interval: getCalendarInterval(nbDays),
					format: getCalendarFormat(nbDays),
					missing: 1
				},
				aggs: {
					term: {
						terms: {
							script:
								'doc["answer_text.keyword"].value + "#" + doc["intention.keyword"].value + "#" + doc["field_label.keyword"].value',
							size: 1000,
							missing: 1
						}
					}
				}
			}
		},
		size: 0
	});

	const tmpBuckets = (
		fieldCodeIntervalAggs?.aggregations?.count_per_month as any
	)?.buckets as BucketsInside;

	let metadata = { total: 0, average: 0 } as {
		total: number;
		average: number;
	};

	let returnValue: Record<
		string,
		Array<{
			answer_text: string;
			intention: AnswerIntention;
			doc_count: number;
		}>
	> = {};
	let bucketsAverage: number[] = [];

	const defaultValues = await getDefaultValues({
		ctx,
		input: {
			field_code: input.field_code,
			exclude_values: tmpBuckets.flatMap(intervalBucket =>
				intervalBucket.term.buckets.map(bucket => bucket.key.split('#')[0])
			)
		}
	});

	tmpBuckets.forEach(bucketInterval => {
		let currentBucketTotal = 0;

		if (!returnValue[bucketInterval.key_as_string])
			returnValue[bucketInterval.key_as_string] = [];

		const currentDefaultValues = defaultValues.filter(
			({ key: defaultValueKey }) =>
				!bucketInterval.term.buckets.some(
					({ key: valueKey }) => valueKey === defaultValueKey
				)
		);

		[...bucketInterval.term.buckets, ...currentDefaultValues].forEach(
			bucket => {
				const [answerText, intention] = bucket.key.split('#');

				metadata.total += bucket.doc_count;
				currentBucketTotal += bucket.doc_count;

				returnValue[bucketInterval.key_as_string].push({
					answer_text: answerText,
					intention: intention as AnswerIntention,
					doc_count: bucket.doc_count
				});
			}
		);

		if (currentBucketTotal !== 0) bucketsAverage.push(currentBucketTotal);
	});

	metadata.average = Number(
		(
			bucketsAverage.reduce((acc, curr) => {
				return acc + curr;
			}, 0) / bucketsAverage.length
		).toFixed(1)
	);

	return { data: returnValue, metadata };
};
