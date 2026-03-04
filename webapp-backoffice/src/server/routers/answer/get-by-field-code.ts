import type { Context } from '@/src/server/trpc';
import { AnswerIntention } from '@prisma/client';
import { z } from 'zod';
import { Buckets, ElkAnswer } from '../../../types/custom';
import {
	checkAndGetForm,
	checkAndGetProduct,
	getDefaultValues,
	queryCountByFieldCode
} from './utils';

export const getByFieldCodeInputSchema = z.object({
	field_code: z.string(),
	product_id: z.number(),
	form_id: z.number(),
	button_id: z.number().optional(),
	start_date: z.string(),
	end_date: z.string(),
	xwiki: z.boolean().optional()
});

export const getByFieldCodeQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getByFieldCodeInputSchema>;
}) => {
	const { product_id, xwiki, button_id, form_id } = input;

	await checkAndGetProduct({ ctx, product_id });
	const form = await checkAndGetForm({ ctx, form_id });

	const fieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
		index: 'jdma-answers',
		track_total_hits: true,
		query: queryCountByFieldCode({
			...input,
			legacy: form.legacy,
			xwiki
		}),
		aggs: {
			term: {
				terms: {
					script:
						'doc["answer_text.keyword"].value + "#" + doc["intention.keyword"].value + "#" + doc["field_label.keyword"].value.trim()',
					size: 1000
				}
			}
		},
		size: 0
	});

	const uniqueCount = await ctx.elkClient.search<ElkAnswer[]>({
		index: 'jdma-answers',
		track_total_hits: true,
		query: queryCountByFieldCode({
			...input,
			legacy: form.legacy
		}),
		aggs: {
			unique_review_ids: {
				cardinality: {
					field: 'review_id',
					precision_threshold: 100000
				}
			}
		}
	});

	const tmpBuckets = (fieldCodeAggs?.aggregations?.term as any)
		?.buckets as Buckets;

	let metadata = {
		total: 0,
		average: 0
	} as {
		total: number;
		average: number;
		fieldLabel?: string;
	};

	metadata.total = (uniqueCount.aggregations as any).unique_review_ids.value;

	const defaultValues = await getDefaultValues({
		ctx,
		input: {
			field_code: input.field_code,
			exclude_values: tmpBuckets.map(bucket => bucket.key.split('#')[0])
		}
	});

	const buckets = [...tmpBuckets, ...defaultValues]
		.map(bucket => {
			const [answerText, intention, fieldLabel] = bucket.key.split('#');

			if (!metadata.fieldLabel) metadata.fieldLabel = fieldLabel;

			let returnValue = {
				answer_text: answerText,
				intention: intention as AnswerIntention,
				answer_score:
					intention === 'good' ? 10 : intention === 'medium' ? 5 : 0,
				doc_count: bucket.doc_count
			};

			return returnValue;
		})
		.sort((a, b) => {
			const aIntention = a.intention;
			const bIntention = b.intention;

			if (aIntention === 'good') return -1;
			if (bIntention === 'good') return 1;
			if (aIntention === 'medium') return -1;
			if (bIntention === 'medium') return 1;
			if (aIntention === 'bad') return -1;
			if (bIntention === 'bad') return 1;
			if (aIntention === 'neutral') return -1;
			if (bIntention === 'neutral') return 1;

			return 0;
		});

	if (!!metadata.total) {
		metadata.average = Number(
			(
				buckets.reduce((acc, curr) => {
					return acc + curr.answer_score * curr.doc_count;
				}, 0) / metadata.total
			).toFixed(1)
		);
	}

	return { data: buckets, metadata };
};
