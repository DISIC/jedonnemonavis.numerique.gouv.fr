import { PrismaClient, Product } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function updateAccessRight(id: number, data: Partial<Product>) {
	const accessRight = await prisma.accessRight.update({
		where: {
			id: id
		},
		data: data
	});
	return accessRight;
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
		const accessRight = await updateAccessRight(parseInt(id as string), data);
		res.status(200).json(accessRight);
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
