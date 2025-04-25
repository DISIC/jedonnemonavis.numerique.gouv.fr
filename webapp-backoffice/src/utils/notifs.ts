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
		products: { productId: number; reviewCount: number; title: string }[];
	}[] = [];

	for (const { scope, startDate, endDate } of scopes) {
		const productsWithReviewCounts = await prisma.review.groupBy({
			by: ['product_id'],
			_count: {
				id: true
			},
			where: {
				created_at: {
					gte: startDate,
					lte: endDate
				}
			}
		});

		const productIds = productsWithReviewCounts.map(entry => entry.product_id);

		const products = await prisma.product.findMany({
			where: {
				id: { in: productIds }
			},
			select: {
				id: true,
				title: true
			}
		});

		const formattedProducts = productsWithReviewCounts.map(entry => {
			const product = products.find(p => p.id === entry.product_id);
			return {
				productId: entry.product_id,
				reviewCount: entry._count.id,
				title: product?.title || ''
			};
		});

		results.push({
			scope,
			startDate,
			endDate,
			products: formattedProducts
		});
	}

	return results;
};
