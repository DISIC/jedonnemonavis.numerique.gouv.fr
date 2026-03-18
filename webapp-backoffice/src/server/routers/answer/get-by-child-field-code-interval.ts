import type { Context } from '@/src/server/trpc';
import {
	getCalendarFormat,
	getCalendarInterval,
	getDiffDaysBetweenTwoDates
} from '@/src/utils/tools';
import { AnswerIntention } from '@prisma/client';
import { z } from 'zod';
import { Buckets, BucketsInside, ElkAnswer } from '../../../types/custom';
import {
	checkAndGetForm,
	checkAndGetProduct,
	getDefaultValues,
	queryCountByFieldCode
} from './utils';

export const getByChildFieldCodeIntervalInputSchema = z.object({
	field_code: z.string(),
	product_id: z.number(),
	form_id: z.number(),
	button_id: z.number().optional(),
	start_date: z.string(),
	end_date: z.string()
});

export const getByChildFieldCodeIntervalQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getByChildFieldCodeIntervalInputSchema>;
}) => {
	const { product_id, form_id, start_date, end_date } = input;

	await checkAndGetProduct({ ctx, product_id });
	const form = await checkAndGetForm({ ctx, form_id });

	const nbDays = getDiffDaysBetweenTwoDates(start_date, end_date);

	const parentFieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
		index: 'jdma-answers',
		track_total_hits: true,
		query: queryCountByFieldCode({
			...input,
			legacy: form.legacy,
			field_code: 'contact_tried'
		}),
		aggs: {
			term: {
				terms: {
					script:
						'doc["answer_item_id"].value + "#" + doc["answer_text.keyword"].value',
					size: 1000
				}
			}
		},
		size: 0
	});

	const parentFieldCode = (
		(parentFieldCodeAggs?.aggregations?.term as any).buckets as Buckets
	).map(bucket => {
		const [key, value] = bucket.key.split('#');
		return {
			key,
			value: value.replace(/\s*avec\s*l\u2019administration/, ''),
			doc_count: bucket.doc_count
		};
	});

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
								'doc["parent_answer_item_id"].value + "#" + doc["intention.keyword"].value + "#" + doc["field_label.keyword"].value',
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

	let defaultValues = await getDefaultValues({
		ctx,
		input: {
			field_code: 'contact_tried',
			exclude_values: [],
			onlyParentValues: true
		}
	});

	tmpBuckets.forEach(bucketInterval => {
		let currentBucketTotal = 0;

		if (!returnValue[bucketInterval.key_as_string])
			returnValue[bucketInterval.key_as_string] = [];

		bucketInterval.term.buckets.forEach(bucket => {
			const [parentAnswerId, intention] = bucket.key.split('#');

			const currentParentFieldCode = parentFieldCode.find(
				({ key }) => key === parentAnswerId
			);

			if (!currentParentFieldCode) return;

			metadata.total += bucket.doc_count;
			currentBucketTotal += bucket.doc_count;

			const currentBucket = returnValue[bucketInterval.key_as_string].find(
				({ answer_text }) => currentParentFieldCode.value === answer_text
			);

			if (currentBucket) {
				currentBucket.doc_count += bucket.doc_count;
			} else {
				returnValue[bucketInterval.key_as_string].push({
					answer_text: currentParentFieldCode.value as string,
					intention: intention as AnswerIntention,
					doc_count: bucket.doc_count
				});
			}
		});

		defaultValues
			.filter(value =>
				returnValue[bucketInterval.key_as_string].every(
					bucket => bucket.answer_text !== value.key.split('#')[0]
				)
			)
			.forEach(defaultValue => {
				returnValue[bucketInterval.key_as_string].push({
					answer_text: defaultValue.key.split('#')[0],
					intention: 'neutral',
					doc_count: 0
				});
			});

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
