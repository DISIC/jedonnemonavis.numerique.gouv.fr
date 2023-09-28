import { PrismaClient, Button } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function getButtons(
	sort?: string,
	search?: string,
	product_id?: string
) {
	let orderBy: any = [
		{
			title: 'asc'
		}
	];

	let where: any = {
		title: {
			contains: ''
		}
	};

	if (product_id) {
		where = {
			product_id: product_id
		};
	}

	if (search) {
		where = {
			title: {
				contains: search,
				mode: 'insensitive'
			}
		};
	}

	if (sort) {
		const values = sort.split(':');
		if (values.length === 2) {
			if (values[0].includes('.')) {
				const subValues = values[0].split('.');
				if (subValues.length === 2) {
					orderBy = [
						{
							[subValues[0]]: {
								[subValues[1]]: values[1]
							}
						}
					];
				}
			} else {
				orderBy = [
					{
						[values[0]]: values[1]
					}
				];
			}
		}
	}

	const buttons = await prisma.button.findMany({
		orderBy,
		where
	});
	return buttons;
}

export async function getButton(id: string) {
	const button = await prisma.button.findUnique({
		where: {
			id: id
		}
	});
	return button;
}

export async function createButton(data: Omit<Button, 'id'>) {
	const button = await prisma.button.create({
		data: data
	});
	return button;
}

export async function updateButton(id: string, data: Partial<Button>) {
	const button = await prisma.button.update({
		where: {
			id: id
		},
		data: data
	});
	return button;
}

export async function deleteButton(id: string) {
	const button = await prisma.button.delete({
		where: {
			id: id
		}
	});
	return button;
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
		const { id, sort, search, product_id } = req.query;
		if (id) {
			const button = await getButton(id.toString());
			res.status(200).json(button);
		} else {
			const buttons = await getButtons(
				sort as string,
				search as string,
				product_id as string
			);
			res.status(200).json(buttons);
		}
	} else if (req.method === 'POST') {
		const data = JSON.parse(req.body);
		const button = await createButton(data);
		res.status(201).json(button);
	} else if (req.method === 'PUT') {
		const { id } = req.query;

		const data = req.body;
		const button = await updateButton(id as string, data);
		res.status(200).json(button);
	} else if (req.method === 'DELETE') {
		const { id } = req.query;
		const button = await deleteButton(id as string);
		res.status(200).json(button);
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
