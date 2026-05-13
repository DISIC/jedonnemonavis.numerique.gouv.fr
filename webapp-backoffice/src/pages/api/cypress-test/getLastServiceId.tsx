import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/utils/db';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (process.env.NODE_ENV === 'production') {
		return res.status(404).json({ error: 'Not found' });
	}

	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const lastTestProduct = await prisma.product.findFirst({
			where: {
				title: {
					equals: 'e2e-jdma-service-test'
				}
			}
		});

		const productId = lastTestProduct ? lastTestProduct.id : null;

		const lastTestButton = await prisma.button.findFirst({
			where: productId ? { form: { product_id: productId } } : {}
		});

		res
			.status(200)
			.json({ productId: productId, lastTestButtonId: lastTestButton?.id });
	} catch (error) {
		console.error('Error getting last product:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}
