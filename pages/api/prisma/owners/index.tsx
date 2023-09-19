import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export async function getOwners() {
	const owners = await prisma.owner.findMany({
		orderBy: [
			{
				name: 'asc'
			}
		]
	});
	return owners;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'GET') {
		const owners = await getOwners();
		res.status(200).json(owners);
	} else {
		res.status(405).json({ message: 'Method not allowed' });
	}
}
