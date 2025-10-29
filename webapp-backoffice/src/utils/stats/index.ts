import { Context } from '../../server/trpc';
import { ElkAnswer } from '../../types/custom';
import { FieldCodeHelper } from '../helpers';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { handleBucket } from './product-builder';

export * from './intention-helpers';
export * from './bucket-parser';
export * from './children-handler';
export * from './product-builder';

export type FetchAndFormatDataProps = {
	ctx: Context;
	field_codes: FieldCodeHelper[];
	product_ids?: string[] | number[];
	start_date: string;
	end_date: string;
	interval: 'day' | 'week' | 'month' | 'year' | 'none';
};

export const fetchAndFormatData = async ({
	ctx,
	field_codes,
	product_ids,
	start_date,
	end_date,
	interval
}: FetchAndFormatDataProps) => {
	let query: QueryDslQueryContainer = {
		bool: {
			must: [
				{
					bool: {
						should: [
							{
								terms: {
									field_code: field_codes.map(fc => fc.slug)
								}
							},
							{
								terms: {
									parent_field_code: field_codes.map(fc => fc.slug)
								}
							}
						]
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
	};

	if (!!product_ids && query?.bool?.must && Array.isArray(query.bool.must)) {
		query.bool.must.push({
			terms: {
				product_id: product_ids
			}
		});
	}

	const fieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
		index: 'jdma-answers',
		query,
		aggs: {
			by_interval: {
				date_histogram: {
					field: 'created_at',
					calendar_interval: interval !== 'none' ? interval : 'year'
				},
				aggs: {
					terms_by_field: {
						terms: {
							script: {
								source: `
								return doc["product_id"].value + "#!#" + (doc["form_id"].length != 0 ? doc["form_id"].value : "1") + "#!#" + doc["field_code.keyword"].value + "#!#" + (doc["parent_field_code.keyword"].length != 0 ? doc["parent_field_code.keyword"].value : "") + "#!#" + (doc["parent_answer_item_id"].length != 0 ? doc["parent_answer_item_id"].value : "") + "#!#" + doc["field_label.keyword"].value + "#!#" + doc["intention.keyword"].value + "#!#" + doc["answer_text.keyword"].value + "#!#" + doc["answer_item_id"].value;
								`,
								lang: 'painless'
							},
							size: 10000
						}
					}
				}
			}
		},
		size: 0
	});

	const intervalBuckets =
		(fieldCodeAggs?.aggregations?.by_interval as any)?.buckets || [];

	const tmpBuckets = intervalBuckets.flatMap((bucket: any) =>
		bucket.terms_by_field.buckets.map((innerBucket: any) => ({
			key: innerBucket.key,
			doc_count: innerBucket.doc_count,
			date: interval !== 'none' ? bucket.key_as_string : 'all_time'
		}))
	);

	const formsHelper = await ctx.prisma.form.findMany({
		where: {
			product_id: { in: product_ids as number[] }
		},
		select: {
			id: true,
			product_id: true,
			legacy: true,
			title: true,
			form_template: { select: { title: true } },
			product: { select: { title: true } }
		}
	});

	return handleBucket(
		tmpBuckets,
		field_codes.map(fc => fc.slug),
		interval,
		formsHelper
	);
};
