import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const lastTestProduct = await prisma.product.findFirst({
			where: {
				title: {
					startsWith: 'e2e-jdma-service-test'
				}
			}
		});

		const productId = lastTestProduct ? lastTestProduct.id : null;

		const lastTestButton = await prisma.button.findFirst({
			where: productId ? { product_id: productId } : {}
		});

		res
			.status(200)
			.json({ productId: productId, lastTestButtonId: lastTestButton?.id });
	} catch (error) {
		console.error('Error getting last product:', error);
		res.status(500).json({ error: 'Internal server error' });
	} finally {
		await prisma.$disconnect();
	}
}
