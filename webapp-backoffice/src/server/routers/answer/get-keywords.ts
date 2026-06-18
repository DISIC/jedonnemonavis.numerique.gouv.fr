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

const CANDIDATE_POOL_SIZE = 200;
const MIN_OCCURRENCES = 5;
const SUBSUMPTION_RATIO = 0.7;

type KeywordBucket = { key: string; count: number };

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

	const mustClauses: QueryDslQueryContainer[] = [
		{ term: { product_id } },
		{ bool: { must_not: { exists: { field: 'deleted_at' } } } }
	];

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
			mustClauses.push({
				bool: {
					should: field.values.map(value => ({
						term: {
							[`review_answers.${field.field_code}`]: value
						}
					}))
				}
			});
		});
	}

	const keywordsAggs = await ctx.elkClient.search({
		index: 'jdma-answers-tokens',
		query: {
			bool: {
				must: mustClauses
			}
		},
		aggs: {
			unigrams: {
				terms: {
					field: 'answer_tokens',
					include: '[^ _]+',
					min_doc_count: MIN_OCCURRENCES,
					size: CANDIDATE_POOL_SIZE
				}
			},
			bigrams: {
				terms: {
					field: 'answer_tokens',
					include: '[^ _]+ [^ _]+',
					min_doc_count: MIN_OCCURRENCES,
					size: CANDIDATE_POOL_SIZE
				}
			}
		},
		size: 0
	});

	const toBuckets = (agg: any): KeywordBucket[] =>
		((agg?.buckets as any[]) ?? []).map(bucket => ({
			key: bucket.key as string,
			count: bucket.doc_count as number
		}));

	const unigrams = toBuckets(keywordsAggs?.aggregations?.unigrams).filter(
		unigram => !excludeKeywords.includes(unigram.key.toLowerCase())
	);

	const bigrams = toBuckets(keywordsAggs?.aggregations?.bigrams).filter(
		bigram =>
			!bigram.key
				.split(' ')
				.every(word => excludeKeywords.includes(word.toLowerCase()))
	);

	const suppressedUnigrams = new Set<string>();
	const subsumingBigrams = new Map<string, KeywordBucket>();

	unigrams.forEach(unigram => {
		const dominantBigram = bigrams
			.filter(bigram => bigram.key.split(' ').includes(unigram.key))
			.reduce<KeywordBucket | null>(
				(max, bigram) => (!max || bigram.count > max.count ? bigram : max),
				null
			);

		if (
			dominantBigram &&
			dominantBigram.count >= unigram.count * SUBSUMPTION_RATIO
		) {
			suppressedUnigrams.add(unigram.key);
			subsumingBigrams.set(dominantBigram.key, dominantBigram);
		}
	});

	const data = [
		...unigrams.filter(unigram => !suppressedUnigrams.has(unigram.key)),
		...subsumingBigrams.values()
	]
		.sort((a, b) => b.count - a.count)
		.slice(0, size)
		.map(({ key, count }) => ({ keyword: key, count }));

	return { data };
};
