import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export async function getProducts() {
	const products = await prisma.product.findMany({
		orderBy: [
			{
				title: 'asc'
			}
		]
	});
	return products;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'GET') {
		const products = await getProducts();
		res.status(200).json(products);
	}
}
