import { fr } from '@codegouvfr/react-dsfr';
import { AnswerIntention } from '@prisma/client';
import { Context } from '../server/trpc';
import {
	Buckets,
	CategoryData,
	ElkAnswer,
	FormHelper,
	Hit,
	OpenProduct,
	ProductMapEntry
} from '../types/custom';
import { FieldCodeHelper } from './helpers';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

export const getIntentionFromAverage = (
	average: number,
	slug?: string
): AnswerIntention => {
	if (slug && slug === 'contact') {
		return average >= 8.5
			? AnswerIntention.good
			: average >= 7
				? AnswerIntention.medium
				: AnswerIntention.bad;
	}

	return average >= 8
		? AnswerIntention.good
		: average >= 5
			? AnswerIntention.medium
			: AnswerIntention.bad;
};

export const getStatsColor = ({
	intention,
	average,
	kind = 'text'
}: {
	intention?: AnswerIntention;
	average?: number;
	kind?: 'text' | 'background';
}) => {
	if (average !== undefined) {
		intention = getIntentionFromAverage(average);
	}
	switch (intention) {
		case AnswerIntention.good:
			return kind === 'text'
				? fr.colors.decisions.text.default.success.default
				: fr.colors.decisions.background.contrast.success.default;
		case AnswerIntention.medium:
			return kind === 'text'
				? fr.colors.decisions.background.flat.yellowTournesol.default
				: fr.colors.decisions.background.alt.yellowTournesol.default;
		case AnswerIntention.bad:
			return kind === 'text'
				? fr.colors.decisions.text.default.error.default
				: fr.colors.decisions.background.contrast.error.default;
		default:
			return 'transparent';
	}
};

export const getStatsIcon = ({
	intention
}: {
	intention?: AnswerIntention;
}) => {
	switch (intention) {
		case AnswerIntention.good:
			return 'good';
		case AnswerIntention.medium:
			return 'medium';
		case AnswerIntention.bad:
			return 'bad';
		default:
			return 'neutral';
	}
};

export const getStatsAnswerText = ({
	buckets,
	intention
}: {
	buckets: {
		answer_text: string;
		intention: AnswerIntention;
	}[];
	intention: AnswerIntention;
}) => {
	const currentAnswerText =
		buckets.find(bucket => bucket.intention === intention)?.answer_text || '';

	return currentAnswerText.charAt(0).toUpperCase() + currentAnswerText.slice(1);
};

export const displayIntention = (intention: string) => {
	switch (intention) {
		case 'bad':
			return 'Mauvais';
		case 'medium':
			return 'Moyen';
		case 'good':
			return 'Très bien';
		case 'neutral':
			return 'Neutre';
		default:
			return intention;
	}
};

const handleChildren = (buckets: Buckets) => {
	let result: CategoryData[] = [];

	buckets.forEach(bucket => {
		const [
			productId,
			productName,
			fieldCode,
			parentFieldCode,
			parentAnswerItemId,
			fieldLabel,
			intention,
			answerText,
			answerItemId
		] = bucket.key.split('#!#');
		const docCount = bucket.doc_count;

		let categoryIndex = result.findIndex(c => c.category === fieldCode);

		if (categoryIndex === -1) {
			const newCategory = {
				category: fieldCode,
				label: fieldLabel,
				number_hits: []
			};
			result.push(newCategory);
			categoryIndex = result.length - 1;
		}

		const children = buckets.filter(b => {
			const bParentFieldCode = b.key.split('#!#')[3];
			return bParentFieldCode === fieldCode;
		}) as Buckets;

		const existingHitIndex = result[categoryIndex].number_hits.findIndex(
			hit => hit.label === answerText && hit.intention === intention
		);

		if (existingHitIndex !== -1) {
			result[categoryIndex].number_hits[existingHitIndex].count += docCount;
		} else {
			result[categoryIndex].number_hits.push({
				intention: intention,
				label: answerText,
				count: docCount,
				children: !!children.length ? handleChildren(children) : undefined
			});
		}
	});

	return result;
};

const handleBucket = (
	buckets: Buckets,
	field_codes_slugs: string[],
	interval: string,
	formsHelper: FormHelper[]
) => {
	let result: OpenProduct[] = [];
	let productMap: { [productId: string]: ProductMapEntry } = {};

	buckets.forEach(bucket => {
		const [
			productId,
			formId,
			fieldCode,
			parentFieldCode,
			parentAnswerItemId,
			fieldLabel,
			intention,
			answerText,
			answerItemId
		] = bucket.key.split('#!#');
		const docCount = bucket.doc_count;
		const docDate = bucket.date;
		let formHelper = formsHelper.find(f => f.id === parseInt(formId, 10));

		if (!formHelper)
			formHelper = formsHelper.find(
				f => !!f.legacy && f.product_id === parseInt(productId, 10)
			);

		const usableFormId = `${formHelper?.id}` || formId;

		if (!productMap.hasOwnProperty(productId)) {
			const newProduct = {
				product_id: productId,
				product_name: formHelper?.product.title || '',
				forms: []
			};
			result.push(newProduct);
			productMap[productId] = {
				productIndex: result.length - 1,
				forms: {}
			};
		}

		const currentProduct = productMap[productId];

		if (!productMap[productId].forms.hasOwnProperty(usableFormId)) {
			const newForm = {
				form_id: `${formHelper?.id}`,
				form_name: formHelper?.title || formHelper?.form_template.title || '',
				intervals: []
			};
			result[currentProduct.productIndex].forms.push(newForm);
			productMap[productId].forms[usableFormId] = {
				formIndex: result[currentProduct.productIndex].forms.length - 1,
				dateMap: {}
			};
		}

		const currentForm = productMap[productId].forms[usableFormId];

		if (!currentForm.dateMap.hasOwnProperty(docDate)) {
			const newDateEntry = {
				date: docDate,
				length_interval: interval,
				data: []
			};
			result[currentProduct.productIndex].forms[
				currentForm.formIndex
			].intervals.push(newDateEntry);
			currentForm.dateMap[docDate] = {
				dateIndex:
					result[currentProduct.productIndex].forms[currentForm.formIndex]
						.intervals.length - 1,
				categories: {}
			};
		}

		const dateIndex = currentForm.dateMap[docDate].dateIndex;

		if (field_codes_slugs.includes(fieldCode)) {
			if (!currentForm.dateMap[docDate].categories.hasOwnProperty(fieldCode)) {
				const newCategory = {
					category: fieldCode,
					label: fieldLabel,
					number_hits: []
				};
				result[currentProduct.productIndex].forms[
					currentForm.formIndex
				].intervals[dateIndex].data.push(newCategory);
				currentForm.dateMap[docDate].categories[fieldCode] =
					result[currentProduct.productIndex].forms[currentForm.formIndex]
						.intervals[dateIndex].data.length - 1;
			}

			const children = buckets.filter(b => {
				const bParentFieldCode = b.key.split('#!#')[3];
				const bParentFieldAnswerItemId = b.key.split('#!#')[4];
				return (
					bParentFieldCode === fieldCode &&
					bParentFieldAnswerItemId === answerItemId
				);
			}) as Buckets;

			const categoryIndex = currentForm.dateMap[docDate].categories[fieldCode];
			const existingHitIndex = result[currentProduct.productIndex].forms[
				currentForm.formIndex
			].intervals[dateIndex].data[categoryIndex].number_hits.findIndex(
				hit => hit.label === answerText && hit.intention === intention
			);

			if (existingHitIndex !== -1) {
				result[currentProduct.productIndex].forms[
					currentForm.formIndex
				].intervals[dateIndex].data[categoryIndex].number_hits[
					existingHitIndex
				].count += docCount;
			} else {
				result[currentProduct.productIndex].forms[
					currentForm.formIndex
				].intervals[dateIndex].data[categoryIndex].number_hits.push({
					intention: intention,
					label: answerText,
					count: docCount,
					children: !!children.length ? handleChildren(children) : undefined
				});
			}
		}
	});

	return result;
};

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
