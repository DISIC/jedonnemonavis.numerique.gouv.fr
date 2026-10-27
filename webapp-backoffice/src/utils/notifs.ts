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
		const reviewCountsByForm = await prisma.review.groupBy({
			by: ['form_id'],
			where: {
				created_at: {
					gte: startDate,
					lte: endDate
				}
			},
			_count: { _all: true }
		});

		const reviewCountByFormId = new Map(
			reviewCountsByForm.map(r => [r.form_id, r._count._all])
		);

		const forms = await prisma.form.findMany({
			where: { id: { in: [...reviewCountByFormId.keys()] } },
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
		});

		const formattedForms = forms.map(form => ({
			formId: form.id,
			formTitle: form.title || `Évaluation de la satisfaction usager`,
			productId: form.product.id,
			productTitle: form.product.title,
			entityName: form.product.entity.name,
			reviewCount: reviewCountByFormId.get(form.id) ?? 0
		}));

		results.push({
			scope,
			startDate,
			endDate,
			forms: formattedForms
		});
	}

	return results;
};
