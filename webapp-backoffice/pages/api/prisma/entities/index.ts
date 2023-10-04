import { Entity, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function getEntities(query: string) {
	const entities = await prisma.entity.findMany({
		orderBy: [
			{
				name: 'asc'
			}
		],
		where: {
			name: {
				contains: query,
				mode: 'insensitive'
			}
		}
	});
	return entities;
}

export async function getEntity(id: string) {
	const entity = await prisma.entity.findUnique({
		where: {
			id: id
		}
	});
	return entity;
}

export async function createEntity(data: Omit<Entity, 'id'>) {
	const entity = await prisma.entity.create({
		data: data
	});
	return entity;
}

export async function updateEntity(id: string, data: Partial<Entity>) {
	const entity = await prisma.entity.update({
		where: {
			id: id
		},
		data: data
	});
	return entity;
}

export async function deleteEntity(id: string) {
	const entity = await prisma.entity.delete({
		where: {
			id: id
		}
	});
	return entity;
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
		const { id, name } = req.query;
		if (id) {
			const entity = await getEntity(id.toString());
			res.status(200).json(entity);
		} else {
			const entities = await getEntities(name as string);
			res.status(200).json(entities);
		}
	} else if (req.method === 'POST') {
		const data = JSON.parse(req.body);
		const entity = await createEntity(data);
		res.status(201).json(entity);
	} else if (req.method === 'PUT') {
		const { id } = req.query;

		const data = req.body;
		const entity = await updateEntity(id as string, data);
		res.status(200).json(entity);
	} else if (req.method === 'DELETE') {
		const { id } = req.query;
		const entity = await deleteEntity(id as string);
		res.status(200).json(entity);
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
