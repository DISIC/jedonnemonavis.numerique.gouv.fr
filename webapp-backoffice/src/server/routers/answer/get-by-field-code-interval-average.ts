import type { Context } from '@/src/server/trpc';
import {
	getCalendarFormat,
	getCalendarInterval,
	getDiffDaysBetweenTwoDates
} from '@/src/utils/tools';
import { z } from 'zod';
import { BucketsInside, ElkAnswer } from '../../../types/custom';

export const getByFieldCodeIntervalAverageInputSchema = z.object({
	field_code: z.string(),
	product_id: z.string() /* To change to button_id */,
	start_date: z.string(),
	end_date: z.string()
});

export const getByFieldCodeIntervalAverageQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getByFieldCodeIntervalAverageInputSchema>;
}) => {
	const { field_code, product_id, start_date, end_date } = input;

	const product = await ctx.prisma.product.findUnique({
		where: {
			id: parseInt(product_id)
		}
	});

	if (!product) throw new Error('Product not found');
	if (!product.isPublic && !ctx.session?.user)
		throw new Error('Product is not public');

	const nbDays = getDiffDaysBetweenTwoDates(start_date, end_date);

	const fieldCodeIntervalAggs = await ctx.elkClient.search<ElkAnswer[]>({
		index: 'jdma-answers',
		query: {
			bool: {
				must: [
					{
						match: {
							field_code
						}
					},
					{
						match: {
							product_id
						}
					},
					{
						range: {
							created_at: {
								gte: start_date,
								lte: end_date
							}
						}
					}
				]
			}
		},
		aggs: {
			count_per_month: {
				date_histogram: {
					field: 'created_at',
					calendar_interval: getCalendarInterval(nbDays),
					format: getCalendarFormat(nbDays)
				},
				aggs: {
					term: {
						terms: {
							script:
								'doc["answer_text.keyword"].value + "#" + doc["intention.keyword"].value + "#" + doc["field_label.keyword"].value',
							size: 1000
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

	let returnValue: Record<string, number> = {};
	let bucketsAverage: number[] = [];

	tmpBuckets.forEach(bucketInterval => {
		let currentBucketMark = 0;
		let currentBucketTotal = 0;

		bucketInterval.term.buckets.forEach(bucket => {
			const [_, intention] = bucket.key.split('#');

			metadata.total += bucket.doc_count;

			currentBucketTotal += bucket.doc_count;
			currentBucketMark +=
				bucket.doc_count *
				(intention === 'good' ? 10 : intention === 'medium' ? 5 : 0);
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
};
