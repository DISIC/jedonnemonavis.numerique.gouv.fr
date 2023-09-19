import { Owner, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

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

export async function getOwner(id: string) {
	const owner = await prisma.owner.findUnique({
		where: {
			id: id
		}
	});
	return owner;
}

export async function createOwner(data: Omit<Owner, 'id'>) {
	const owner = await prisma.owner.create({
		data: data
	});
	return owner;
}

export async function updateOwner(id: string, data: Partial<Owner>) {
	const owner = await prisma.owner.update({
		where: {
			id: id
		},
		data: data
	});
	return owner;
}

export async function deleteOwner(id: string) {
	const owner = await prisma.owner.delete({
		where: {
			id: id
		}
	});
	return owner;
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
	if (req.method === 'GET') {
		const { id } = req.query;
		if (id) {
			const owner = await getOwner(id.toString());
			res.status(200).json(owner);
		} else {
			const owners = await getOwners();
			res.status(200).json(owners);
		}
	} else if (req.method === 'POST') {
		const data = JSON.parse(req.body);
		const owner = await createOwner(data);
		res.status(201).json(owner);
	} else if (req.method === 'PUT') {
		const { id } = req.query;

		const data = req.body;
		const owner = await updateOwner(id as string, data);
		res.status(200).json(owner);
	} else if (req.method === 'DELETE') {
		const { id } = req.query;
		const owner = await deleteOwner(id as string);
		res.status(200).json(owner);
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
