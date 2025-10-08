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
	ProductMapEntry,
	BucketData,
	ProductBuilder
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

const ensureCategoryExists = (
	categories: CategoryData[],
	bucketData: BucketData
): number => {
	let categoryIndex = categories.findIndex(
		c => c.category === bucketData.fieldCode
	);

	if (categoryIndex === -1) {
		const newCategory: CategoryData = {
			category: bucketData.fieldCode,
			label: bucketData.fieldLabel,
			number_hits: []
		};
		categories.push(newCategory);
		categoryIndex = categories.length - 1;
	}

	return categoryIndex;
};

const findChildBuckets = (
	buckets: Buckets,
	parentFieldCode: string
): Buckets => {
	return buckets.filter(b => {
		const childBucketData = parseBucketKey(b);
		return childBucketData.parentFieldCode === parentFieldCode;
	}) as Buckets;
};

const addOrUpdateHitInCategory = (
	category: CategoryData,
	bucketData: BucketData,
	children?: CategoryData[]
): void => {
	const existingHitIndex = category.number_hits.findIndex(
		hit =>
			hit.label === bucketData.answerText &&
			hit.intention === bucketData.intention
	);

	if (existingHitIndex !== -1) {
		category.number_hits[existingHitIndex].count += bucketData.docCount;
	} else {
		category.number_hits.push({
			intention: bucketData.intention,
			label: bucketData.answerText,
			count: bucketData.docCount,
			children
		});
	}
};

const handleChildren = (buckets: Buckets): CategoryData[] => {
	const categories: CategoryData[] = [];

	buckets.forEach(bucket => {
		const bucketData = parseBucketKey(bucket);

		const categoryIndex = ensureCategoryExists(categories, bucketData);
		const childBuckets = findChildBuckets(buckets, bucketData.fieldCode);
		const childCategories =
			childBuckets.length > 0 ? handleChildren(childBuckets) : undefined;

		addOrUpdateHitInCategory(
			categories[categoryIndex],
			bucketData,
			childCategories
		);
	});

	return categories;
};

const parseBucketKey = (bucket: any): BucketData => {
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

	return {
		productId,
		formId,
		fieldCode,
		parentFieldCode,
		parentAnswerItemId,
		fieldLabel,
		intention,
		answerText,
		answerItemId,
		docCount: bucket.doc_count,
		docDate: bucket.date
	};
};

const findFormHelper = (
	bucketData: BucketData,
	formsHelper: FormHelper[]
): FormHelper | undefined => {
	let formHelper = formsHelper.find(
		f => f.id === parseInt(bucketData.formId, 10)
	);

	if (!formHelper) {
		formHelper = formsHelper.find(
			f => !!f.legacy && f.product_id === parseInt(bucketData.productId, 10)
		);
	}

	return formHelper;
};

const ensureProduct = (
	builder: ProductBuilder,
	bucketData: BucketData,
	formHelper?: FormHelper
): void => {
	if (!builder.productIndexMap.has(bucketData.productId)) {
		const newProduct: OpenProduct = {
			product_id: bucketData.productId,
			product_name: formHelper?.product.title || '',
			forms: []
		};

		builder.products.push(newProduct);
		builder.productIndexMap.set(
			bucketData.productId,
			builder.products.length - 1
		);
		builder.formIndexMap.set(bucketData.productId, new Map());
		builder.intervalIndexMap.set(bucketData.productId, new Map());
		builder.categoryIndexMap.set(bucketData.productId, new Map());
	}
};

const ensureForm = (
	builder: ProductBuilder,
	bucketData: BucketData,
	formHelper?: FormHelper
): void => {
	const usableFormId = `${formHelper?.id}` || bucketData.formId;
	const productIndex = builder.productIndexMap.get(bucketData.productId)!;
	const formMap = builder.formIndexMap.get(bucketData.productId)!;

	if (!formMap.has(usableFormId)) {
		const newForm = {
			form_id: `${formHelper?.id}`,
			form_name: formHelper?.title || formHelper?.form_template.title || '',
			intervals: []
		};

		builder.products[productIndex].forms.push(newForm);
		formMap.set(usableFormId, builder.products[productIndex].forms.length - 1);
		builder.intervalIndexMap
			.get(bucketData.productId)!
			.set(usableFormId, new Map());
		builder.categoryIndexMap
			.get(bucketData.productId)!
			.set(usableFormId, new Map());
	}
};

const ensureInterval = (
	builder: ProductBuilder,
	bucketData: BucketData,
	interval: string,
	formHelper?: FormHelper
): void => {
	const usableFormId = `${formHelper?.id}` || bucketData.formId;
	const productIndex = builder.productIndexMap.get(bucketData.productId)!;
	const formIndex = builder.formIndexMap
		.get(bucketData.productId)!
		.get(usableFormId)!;
	const intervalMap = builder.intervalIndexMap
		.get(bucketData.productId)!
		.get(usableFormId)!;

	if (!intervalMap.has(bucketData.docDate)) {
		const newInterval = {
			date: bucketData.docDate,
			length_interval: interval,
			data: []
		};

		builder.products[productIndex].forms[formIndex].intervals.push(newInterval);
		intervalMap.set(
			bucketData.docDate,
			builder.products[productIndex].forms[formIndex].intervals.length - 1
		);
		builder.categoryIndexMap
			.get(bucketData.productId)!
			.get(usableFormId)!
			.set(bucketData.docDate, new Map());
	}
};

const ensureCategory = (
	builder: ProductBuilder,
	bucketData: BucketData,
	formHelper?: FormHelper
): void => {
	const usableFormId = `${formHelper?.id}` || bucketData.formId;
	const productIndex = builder.productIndexMap.get(bucketData.productId)!;
	const formIndex = builder.formIndexMap
		.get(bucketData.productId)!
		.get(usableFormId)!;
	const intervalIndex = builder.intervalIndexMap
		.get(bucketData.productId)!
		.get(usableFormId)!
		.get(bucketData.docDate)!;
	const categoryMap = builder.categoryIndexMap
		.get(bucketData.productId)!
		.get(usableFormId)!
		.get(bucketData.docDate)!;

	if (!categoryMap.has(bucketData.fieldCode)) {
		const newCategory = {
			category: bucketData.fieldCode,
			label: bucketData.fieldLabel,
			number_hits: []
		};

		builder.products[productIndex].forms[formIndex].intervals[
			intervalIndex
		].data.push(newCategory);
		categoryMap.set(
			bucketData.fieldCode,
			builder.products[productIndex].forms[formIndex].intervals[intervalIndex]
				.data.length - 1
		);
	}
};

const findChildren = (buckets: Buckets, bucketData: BucketData): Buckets => {
	return buckets.filter(b => {
		const [, , , bParentFieldCode, bParentFieldAnswerItemId] =
			b.key.split('#!#');
		return (
			bParentFieldCode === bucketData.fieldCode &&
			bParentFieldAnswerItemId === bucketData.answerItemId
		);
	}) as Buckets;
};

const addOrUpdateHit = (
	builder: ProductBuilder,
	bucketData: BucketData,
	children: Buckets,
	formHelper?: FormHelper
): void => {
	const usableFormId = `${formHelper?.id}` || bucketData.formId;
	const productIndex = builder.productIndexMap.get(bucketData.productId)!;
	const formIndex = builder.formIndexMap
		.get(bucketData.productId)!
		.get(usableFormId)!;
	const intervalIndex = builder.intervalIndexMap
		.get(bucketData.productId)!
		.get(usableFormId)!
		.get(bucketData.docDate)!;
	const categoryIndex = builder.categoryIndexMap
		.get(bucketData.productId)!
		.get(usableFormId)!
		.get(bucketData.docDate)!
		.get(bucketData.fieldCode)!;

	const hits =
		builder.products[productIndex].forms[formIndex].intervals[intervalIndex]
			.data[categoryIndex].number_hits;
	const existingHitIndex = hits.findIndex(
		hit =>
			hit.label === bucketData.answerText &&
			hit.intention === bucketData.intention
	);

	if (existingHitIndex !== -1) {
		hits[existingHitIndex].count += bucketData.docCount;
	} else {
		hits.push({
			intention: bucketData.intention,
			label: bucketData.answerText,
			count: bucketData.docCount,
			children: children.length > 0 ? handleChildren(children) : undefined
		});
	}
};

const handleBucket = (
	buckets: Buckets,
	field_codes_slugs: string[],
	interval: string,
	formsHelper: FormHelper[]
): OpenProduct[] => {
	const builder: ProductBuilder = {
		products: [],
		productIndexMap: new Map(),
		formIndexMap: new Map(),
		intervalIndexMap: new Map(),
		categoryIndexMap: new Map()
	};

	buckets.forEach(bucket => {
		const bucketData = parseBucketKey(bucket);

		if (!field_codes_slugs.includes(bucketData.fieldCode)) {
			return;
		}

		const formHelper = findFormHelper(bucketData, formsHelper);

		ensureProduct(builder, bucketData, formHelper);
		ensureForm(builder, bucketData, formHelper);
		ensureInterval(builder, bucketData, interval, formHelper);
		ensureCategory(builder, bucketData, formHelper);

		const children = findChildren(buckets, bucketData);
		addOrUpdateHit(builder, bucketData, children, formHelper);
	});

	return builder.products;
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
