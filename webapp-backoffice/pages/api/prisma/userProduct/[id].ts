import { PrismaClient, Product } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function updateUserProduct(id: number, data: Partial<Product>) {
	const userProduct = await prisma.userProduct.update({
		where: {
			id: id
		},
		data: data
	});
	return userProduct;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
		const token = await getToken({
			req,
			secret: process.env.JWT_SECRET
		});
		if (!token || (token.exp as number) > new Date().getTime())
			return res.status(401).json({ msg: 'You shall not pass.' });
	}
	if (req.method === 'PUT') {
		const { id } = req.query;
		const data = JSON.parse(req.body);
		const userProduct = await updateUserProduct(parseInt(id as string), data);
		res.status(200).json(userProduct);
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
