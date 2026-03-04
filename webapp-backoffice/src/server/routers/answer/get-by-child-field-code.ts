import type { Context } from '@/src/server/trpc';
import { AnswerIntention } from '@prisma/client';
import { z } from 'zod';
import { Buckets, ElkAnswer } from '../../../types/custom';
import {
	checkAndGetForm,
	checkAndGetProduct,
	getDefaultChildValues,
	queryCountByFieldCode
} from './utils';

export const getByChildFieldCodeInputSchema = z.object({
	field_code: z.enum(['contact_reached', 'contact_satisfaction']),
	product_id: z.number(),
	form_id: z.number(),
	button_id: z.number().optional(),
	start_date: z.string(),
	end_date: z.string()
});

export const getByChildFieldCodeQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getByChildFieldCodeInputSchema>;
}) => {
	const { product_id, form_id } = input;

	await checkAndGetProduct({ ctx, product_id });
	const form = await checkAndGetForm({ ctx, form_id });

	const parentFieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
		index: 'jdma-answers',
		track_total_hits: true,
		query: {
			...queryCountByFieldCode({
				...input,
				legacy: form.legacy,
				field_code: 'contact_tried',
				only_parent_values: true
			})
		},
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

	const fieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
		index: 'jdma-answers',
		track_total_hits: true,
		query: {
			...queryCountByFieldCode({
				...input,
				legacy: form.legacy
			})
		},
		aggs: {
			term: {
				terms: {
					script:
						"doc['parent_answer_item_id'].value + '#' + doc['answer_text.keyword'].value + '#' + doc['intention.keyword'].value + '#' + doc['field_label.keyword'].value",
					size: 1000
				}
			}
		},
		size: 0
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

	metadata.total = (fieldCodeAggs.hits?.total as any)?.value;

	const defaultValues = await getDefaultChildValues({
		ctx,
		input: {
			field_code: input.field_code,
			parentFieldCode,
			exclude_values: tmpBuckets.flatMap(intervalBucket =>
				intervalBucket.key.split('#').slice(0, 2).join('#')
			)
		}
	});

	const buckets = [...tmpBuckets, ...defaultValues]
		.map(bucket => {
			const [parentAnswerItemId, answerText, intention, fieldLabel] =
				bucket.key.split('#');

			if (!metadata.fieldLabel) metadata.fieldLabel = fieldLabel;

			let returnValue = {
				parent_answer_id: parentAnswerItemId,
				parent_answer_text: parentFieldCode.find(
					({ key }) => key === parentAnswerItemId
				)?.value as string,
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

	const groupedBuckets = buckets.reduce(
		(acc, curr) => {
			if (!acc[curr.parent_answer_text]) acc[curr.parent_answer_text] = [];
			acc[curr.parent_answer_text].push(curr);

			return acc;
		},
		{} as Record<string, any[]>
	);

	if (input.field_code === 'contact_reached') {
		Object.keys(groupedBuckets).forEach(currentKey => {
			const currentParentFieldCode = parentFieldCode.find(
				({ value }) => value === currentKey
			);

			if (!currentParentFieldCode) return;

			const currentDocCount = groupedBuckets[currentKey].reduce(
				(acc, curr) => acc + curr.doc_count,
				0
			);

			if (currentParentFieldCode.doc_count !== currentDocCount) {
				groupedBuckets[currentKey].push({
					parent_answer_id: currentParentFieldCode.key,
					parent_answer_text: currentParentFieldCode.value,
					answer_text: 'Pas de réponse',
					intention: 'neutral',
					answer_score: 0,
					doc_count: currentParentFieldCode.doc_count - currentDocCount
				});
			}
		});
	}

	return { data: groupedBuckets, metadata };
};
