import { Buckets, CategoryData, BucketData } from '../../types/custom';
import { parseBucketKey } from './bucket-parser';

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

export const handleChildren = (buckets: Buckets): CategoryData[] => {
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
