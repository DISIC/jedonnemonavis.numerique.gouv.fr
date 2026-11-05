import {
	ProductBuilder,
	BucketData,
	CategoryData,
	FormHelper,
	Hit,
	OpenProduct,
	Buckets
} from '../../types/custom';
import { parseBucketKey } from './bucket-parser';
import { handleChildren } from './children-handler';

const resolveFormHelper = (
	productId: string,
	formId: string,
	formsHelper: FormHelper[]
): FormHelper | undefined => {
	const byId = formsHelper.find(f => f.id === parseInt(formId, 10));

	if (byId) {
		return byId;
	}

	return formsHelper.find(
		f => !!f.legacy && f.product_id === parseInt(productId, 10)
	);
};

const findFormHelper = (
	bucketData: BucketData,
	formsHelper: FormHelper[]
): FormHelper | undefined =>
	resolveFormHelper(bucketData.productId, bucketData.formId, formsHelper);

/**
 * Identité du formulaire de sortie auquel un bucket appartient.
 *
 * Sur un formulaire historique, les avis migrés de l'ancien outil portent des
 * `form_id` qui sont des pseudo-identifiants (1 ou 2), là où les avis récents
 * portent la vraie clé. `findFormHelper` les ramène tous au même formulaire, et
 * c'est bien le même : comparer les `form_id` bruts revenait à séparer une
 * réponse parente de ses sous-réponses dès que les deux ne venaient pas du même
 * lot. Le repli sur les valeurs brutes ne sert que pour un bucket qui ne se
 * résout pas, pour ne pas confondre deux formulaires inconnus.
 *
 * Mémoïsé : `findChildren` est appelée par bucket et rebalaie toute la liste.
 */
const makeFormKey = (formsHelper: FormHelper[]) => {
	const cache = new Map<string, string>();

	return (productId: string, formId: string): string => {
		const raw = `${productId}#!#${formId}`;
		const cached = cache.get(raw);

		if (cached !== undefined) {
			return cached;
		}

		const helper = resolveFormHelper(productId, formId, formsHelper);
		const key = helper ? `form:${helper.id}` : `raw:${raw}`;

		cache.set(raw, key);

		return key;
	};
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
 * Les deux premiers critères ne sont pas redondants avec les deux derniers.
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
 * La comparaison porte sur `bucket_date`, la provenance réelle, et non sur
 * `date`, qui vaut `all_time` en `interval: 'none'`. Sans cela ce mode
 * récupérerait toutes les périodes d'un coup sur la première réponse
 * rencontrée, et `addOrUpdateHit` les recompterait à chaque fusion.
 */
const findChildren = (
	buckets: Buckets,
	bucketData: BucketData,
	formKey: (productId: string, formId: string) => string
): Buckets => {
	const parentFormKey = formKey(bucketData.productId, bucketData.formId);

	return buckets.filter(b => {
		const [bProductId, bFormId, , bParentFieldCode, bParentFieldAnswerItemId] =
			b.key.split('#!#');
		return (
			b.bucket_date === bucketData.bucketDate &&
			formKey(bProductId, bFormId) === parentFormKey &&
			bParentFieldCode === bucketData.fieldCode &&
			bParentFieldAnswerItemId === bucketData.answerItemId
		);
	}) as Buckets;
};

/** Identité d'un bucket enfant, pour ne jamais le compter deux fois. */
const childBucketId = (bucket: Buckets[number]): string =>
	`${bucket.bucket_date}#!#${bucket.key}`;

/**
 * Replie `incoming` dans `target`, catégorie par catégorie puis réponse par
 * réponse, en additionnant les compteurs et en descendant récursivement.
 *
 * Nécessaire parce qu'une même réponse de sortie agrège plusieurs buckets : une
 * option dont l'identifiant a changé au fil des versions du gabarit, ou un
 * formulaire historique dont les avis migrés portent un `form_id` différent.
 * Ces buckets ont chacun leurs propres sous-réponses, et les écraser revenait à
 * ne garder que celles du premier rencontré.
 */
const mergeCategories = (
	target: CategoryData[],
	incoming: CategoryData[]
): CategoryData[] => {
	incoming.forEach(category => {
		const existing = target.find(c => c.category === category.category);

		if (!existing) {
			target.push(category);
			return;
		}

		category.number_hits.forEach(hit => {
			const match = existing.number_hits.find(
				h => h.label === hit.label && h.intention === hit.intention
			);

			if (!match) {
				existing.number_hits.push(hit);
				return;
			}

			match.count += hit.count;

			if (hit.children) {
				match.children = match.children
					? mergeCategories(match.children, hit.children)
					: hit.children;
			}
		});
	});

	return target;
};

const addOrUpdateHit = (
	builder: ProductBuilder,
	bucketData: BucketData,
	children: Buckets,
	consumedChildren: WeakMap<Hit, Set<string>>,
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
		const hit = hits[existingHitIndex];

		hit.count += bucketData.docCount;

		// Deux buckets distincts peuvent désigner la même réponse de sortie tout en
		// pointant vers les mêmes enfants — même option, libellé de question
		// reformulé. On ne replie donc que ce que cette réponse n'a pas déjà pris.
		const consumed = consumedChildren.get(hit) ?? new Set<string>();
		const fresh = children.filter(b => !consumed.has(childBucketId(b)));

		if (fresh.length > 0) {
			fresh.forEach(b => consumed.add(childBucketId(b)));
			consumedChildren.set(hit, consumed);

			const incoming = handleChildren(fresh);

			hit.children = hit.children
				? mergeCategories(hit.children, incoming)
				: incoming;
		}
	} else {
		const hit: Hit = {
			intention: bucketData.intention,
			label: bucketData.answerText,
			count: bucketData.docCount,
			children: children.length > 0 ? handleChildren(children) : undefined
		};

		hits.push(hit);
		consumedChildren.set(hit, new Set(children.map(childBucketId)));
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

	// Buckets enfants déjà repliés dans une réponse donnée. Porté hors de la
	// sortie pour ne pas polluer la réponse de l'API.
	const consumedChildren = new WeakMap<Hit, Set<string>>();

	const formKey = makeFormKey(formsHelper);

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

		const children = findChildren(buckets, bucketData, formKey);
		addOrUpdateHit(builder, bucketData, children, consumedChildren, formHelper);
	});

	return builder.products;
};
