import {
	ProductBuilder,
	BucketData,
	FormHelper,
	OpenProduct,
	Buckets
} from '../../types/custom';
import { parseBucketKey } from './bucket-parser';
import { handleChildren } from './children-handler';

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

/**
 * Sous-réponses d'une réponse parente.
 *
 * Les trois premiers critères ne sont pas redondants avec les deux derniers.
 * `buckets` est la liste **aplatie de tous les intervalles**, services et
 * formulaires confondus : le `date_histogram` a été écrasé par le `flatMap` de
 * `fetchAndFormatData`, qui s'est contenté d'ajouter `date` à chaque bucket.
 *
 * Et `parent_answer_item_id` n'identifie pas un avis mais une *option de
 * formulaire* (cf. l'indexation côté webapp-form) : il est donc stable d'une
 * année sur l'autre, et partagé par tous les services qui utilisent le même
 * gabarit. À lui seul il ne discrimine donc rien.
 *
 * Sans ces égalités, les sous-réponses de toute la période remontaient dans
 * chaque bucket : un appel 2019→2026 en `interval: 'year'` renvoyait le total
 * toutes années confondues, identique sur 2024, 2025 et 2026, là où l'appel
 * sur la seule année 2024 donnait le bon chiffre.
 *
 * `interval: 'none'` n'est pas affecté : tous les buckets y portent la même
 * date `all_time`, et l'égalité est alors toujours vraie.
 */
const findChildren = (buckets: Buckets, bucketData: BucketData): Buckets => {
	return buckets.filter(b => {
		const [bProductId, bFormId, , bParentFieldCode, bParentFieldAnswerItemId] =
			b.key.split('#!#');
		return (
			b.date === bucketData.docDate &&
			bProductId === bucketData.productId &&
			bFormId === bucketData.formId &&
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

export const handleBucket = (
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
