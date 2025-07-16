import { PrismaClient } from '@prisma/client';

export const getProductsWithReviewCountsByScope = async (
	prisma: PrismaClient,
	scopes: {
		scope: 'daily' | 'weekly' | 'monthly';
		startDate: Date;
		endDate: Date;
	}[]
) => {
	const results: {
		scope: 'daily' | 'weekly' | 'monthly';
		startDate: Date;
		endDate: Date;
		forms: { 
			formId: number; 
			formTitle: string; 
			reviewCount: number; 
			productId: number; 
			productTitle: string;
			entityName: string;
		}[];
	}[] = [];

	for (const { scope, startDate, endDate } of scopes) {
		// Group reviews by form_id via the button relation
		const reviewsWithFormData = await prisma.review.findMany({
			where: {
				created_at: {
					gte: startDate,
					lte: endDate
				}
			},
			select: {
				id: true,
				button: {
					select: {
						form: {
							select: {
								id: true,
								title: true,
								product: {
									select: {
										id: true,
										title: true,
										entity: {
											select: {
												name: true
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});

		// Group by form_id and count reviews
		const formReviewCounts = new Map<number, {
			formId: number;
			formTitle: string;
			productId: number;
			productTitle: string;
			entityName: string;
			reviewCount: number;
		}>();

		reviewsWithFormData.forEach(review => {
			const form = review.button.form;
			const formId = form.id;
			
			if (formReviewCounts.has(formId)) {
				formReviewCounts.get(formId)!.reviewCount += 1;
			} else {
				formReviewCounts.set(formId, {
					formId: formId,
					formTitle: form.title || `Évaluation de la satisfaction usager`,
					productId: form.product.id,
					productTitle: form.product.title,
					entityName: form.product.entity.name,
					reviewCount: 1
				});
			}
		});

		const formattedForms = Array.from(formReviewCounts.values());

		results.push({
			scope,
			startDate,
			endDate,
			forms: formattedForms
		});
	}

	return results;
};
