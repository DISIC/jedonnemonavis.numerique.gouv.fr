import { fr } from '@codegouvfr/react-dsfr';
import { AnswerIntention } from '@prisma/client';
import { Context } from '../server/trpc';
import {
	Buckets,
	CategoryData,
	ElkAnswer,
	Hit,
	OpenProduct,
	ProductMapEntry
} from '../types/custom';
import { FieldCodeHelper } from './helpers';

export const getIntentionFromAverage = (average: number): AnswerIntention => {
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
				? fr.colors.decisions.text.label.yellowTournesol.default
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
	intention,
	average
}: {
	intention?: AnswerIntention;
	average?: number;
}) => {
	if (average !== undefined) {
		intention = getIntentionFromAverage(average);
	}
	switch (intention) {
		case AnswerIntention.good:
			return 'ri-emotion-happy-line';
		case AnswerIntention.medium:
			return 'ri-emotion-normal-line';
		case AnswerIntention.bad:
			return 'ri-emotion-unhappy-line';
		default:
			return 'ri-question-line';
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
			return '';
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

		result[categoryIndex].number_hits.push({
			intention: intention,
			label: answerText,
			count: docCount,
			children: !!children.length ? handleChildren(children) : undefined
		});
	});

	return result;
};

const handleBucket = (buckets: Buckets, field_codes_slugs: string[]) => {
	let result: OpenProduct[] = [];
	let productMap: { [productId: string]: ProductMapEntry } = {};

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

		if (!productMap.hasOwnProperty(productId)) {
			const newProduct = {
				product_id: productId,
				product_name: productName,
				data: []
			};
			result.push(newProduct);
			productMap[productId] = {
				productIndex: result.length - 1,
				categories: {}
			};
		}

		const productIndex = productMap[productId].productIndex;

		if (field_codes_slugs.includes(fieldCode)) {
			if (!productMap[productId].categories.hasOwnProperty(fieldCode)) {
				const newCategory = {
					category: fieldCode,
					label: fieldLabel,
					number_hits: []
				};
				result[productIndex].data.push(newCategory);
				productMap[productId].categories[fieldCode] =
					result[productIndex].data.length - 1;
			}

			const children = buckets.filter(b => {
				const bParentFieldCode = b.key.split('#!#')[3];
				const bParentFieldAnswerItemId = b.key.split('#!#')[4];
				return (
					bParentFieldCode === fieldCode &&
					bParentFieldAnswerItemId === answerItemId
				);
			}) as Buckets;

			const categoryIndex = productMap[productId].categories[fieldCode];
			const existingHitIndex = result[productIndex].data[
				categoryIndex
			].number_hits.findIndex(hit => hit.label === answerText);

			if (existingHitIndex !== -1) {
				result[productIndex].data[categoryIndex].number_hits[
					existingHitIndex
				].count += docCount;
			} else {
				result[productIndex].data[categoryIndex].number_hits.push({
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

export const fetchAndFormatData = async ({
	ctx,
	field_codes,
	product_ids,
	start_date,
	end_date
}: {
	ctx: Context;
	field_codes: FieldCodeHelper[];
	product_ids: string[] | number[];
	start_date: string;
	end_date: string;
}) => {
	const fieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
		index: 'jdma-answers',
		query: {
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
						terms: {
							product_id: product_ids
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
			term: {
				terms: {
					script: {
						source: `
						doc["product_id"].value + "#!#" + doc["product_name.keyword"].value + "#!#" + doc["field_code.keyword"].value + "#!#" + (doc["parent_field_code.keyword"].length != 0 ? doc["parent_field_code.keyword"].value : "") + "#!#" + (doc["parent_answer_item_id"].length != 0 ? doc["parent_answer_item_id"].value : "") + "#!#" + doc["field_label.keyword"].value + "#!#" + doc["intention.keyword"].value + "#!#" + doc["answer_text.keyword"].value + "#!#" + doc["answer_item_id"].value
						`,
						lang: 'painless'
					},
					size: 10000
				}
			}
		},
		size: 0
	});

	const tmpBuckets = (fieldCodeAggs?.aggregations?.term as any)
		?.buckets as Buckets;

	return handleBucket(
		tmpBuckets,
		field_codes.map(fc => fc.slug)
	);
};
