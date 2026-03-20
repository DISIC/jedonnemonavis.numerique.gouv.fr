import type { Context } from '@/src/server/trpc';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { z } from 'zod';
import { excludeKeywords } from '../../../utils/keywords';
import { checkAndGetForm, checkAndGetProduct } from './utils';

export const getKeywordsInputSchema = z.object({
	product_id: z.number(),
	form_id: z.number(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	fields: z
		.array(
			z.object({
				field_code: z.string(),
				values: z.array(z.string())
			})
		)
		.optional(),
	size: z.number().optional().default(10)
});

export const getKeywordsQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getKeywordsInputSchema>;
}) => {
	const { product_id, form_id, start_date, end_date, size, fields } = input;

	await checkAndGetProduct({ ctx, product_id });
	const form = await checkAndGetForm({ ctx, form_id });

	const mustClauses: QueryDslQueryContainer[] = [{ term: { product_id } }];

	if (form.legacy) {
		mustClauses.push({
			bool: {
				should: [
					{ term: { form_id: form_id } },
					{ term: { form_id: 2 } },
					{ bool: { must_not: { exists: { field: 'form_id' } } } }
				]
			}
		});
	} else {
		mustClauses.push({
			term: { form_id }
		});
	}

	if (start_date && end_date) {
		mustClauses.push({
			range: {
				review_created_at: {
					gte: start_date,
					lte: end_date
				}
			}
		});
	}

	if (fields && fields.length > 0) {
		fields.forEach(field => {
			field.values.forEach(value => {
				mustClauses.push({
					term: {
						[`review_answers.${field.field_code}`]: value
					}
				});
			});
		});
	}

	const keywordsAggs = await ctx.elkClient.search({
		index: 'jdma-answers-tokens',
		query: {
			bool: {
				must: mustClauses,
				must_not: [
					{
						wildcard: {
							answer_tokens: '*_*'
						}
					}
				]
			}
		},
		aggs: {
			keywords: {
				terms: {
					field: 'answer_tokens',
					size: size + excludeKeywords.length
				}
			}
		},
		size: 0
	});

	const buckets = (keywordsAggs?.aggregations?.keywords as any)?.buckets ?? [];

	const data = buckets
		.filter(
			(bucket: any) =>
				bucket.doc_count >= 5 &&
				!excludeKeywords.includes(bucket.key.toLowerCase())
		)
		.slice(0, size)
		.map((bucket: any) => ({
			keyword: bucket.key,
			count: bucket.doc_count
		}));

	return { data: data as { keyword: string; count: number }[] };
};
