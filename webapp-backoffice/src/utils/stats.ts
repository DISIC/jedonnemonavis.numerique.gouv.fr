import { fr } from '@codegouvfr/react-dsfr';
import { AnswerIntention } from '@prisma/client';
import { Context } from '../server/trpc';
import {
	Buckets,
	ElkAnswer,
	OpenProduct,
	ProductMapEntry
} from '../types/custom';

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

export const fetchAndFormatData = async ({
	ctx,
	field_codes,
	product_ids,
	start_date,
	end_date
}: {
	ctx: Context;
	field_codes: string[];
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
						terms: {
							field_code: field_codes
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
					script:
						'doc["product_id"].value + "#!#" + doc["product_name.keyword"].value + "#!#" + doc["field_code.keyword"].value + "#!#" + doc["field_label.keyword"].value + "#!#" + doc["intention.keyword"].value + "#!#" + doc["answer_text.keyword"].value',
					size: 10000		
				}
			}
		},
		size: 0
	});

	const tmpBuckets = (fieldCodeAggs?.aggregations?.term as any)
		?.buckets as Buckets;

	let result: OpenProduct[] = [];

	let productMap: { [productId: string]: ProductMapEntry } = {};

	tmpBuckets.forEach(bucket => {
		const [
			productId,
			productName,
			fieldCode,
			fieldLabel,
			intention,
			answerText
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

		const categoryIndex = productMap[productId].categories[fieldCode];
		result[productIndex].data[categoryIndex].number_hits.push({
			intention: intention,
			label: answerText,
			count: docCount
		});
	});

	return result;
};
