import { BucketData } from '../../types/custom';

export const parseBucketKey = (bucket: any): BucketData => {
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
