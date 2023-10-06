import { PrismaClient, Button } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function getButtons(
	numberPerPage: number,
	page: number,
	sort?: string,
	search?: string,
	product_id?: number
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
		where,
		take: numberPerPage,
		skip: numberPerPage * (page - 1)
	});

	const count = await prisma.button.count({ where });

	return { data: buttons, count: count };
}

export async function getButton(id: number) {
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

export async function updateButton(id: number, data: Partial<Button>) {
	const button = await prisma.button.update({
		where: {
			id: id
		},
		data: data
	});
	return button;
}

export async function deleteButton(id: number) {
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
		const { id, sort, search, product_id, numberPerPage, page } = req.query;
		if (id) {
			const button = await getButton(parseInt(id as string));
			return res.status(200).json(button);
		} else {
			if (!numberPerPage || !page) {
				return res
					.status(400)
					.json({ message: 'Missing numberPerPage or page' });
			}
			const buttons = await getButtons(
				parseInt(numberPerPage as string, 10) as number,
				parseInt(page as string, 10) as number,
				sort as string,
				search as string,
				parseInt(product_id as string)
			);
			return res.status(200).json(buttons);
		}
	} else if (req.method === 'POST') {
		const data = JSON.parse(req.body);
		const button = await createButton(data);
		return res.status(201).json(button);
	} else if (req.method === 'PUT') {
		const { id } = req.query;

		const data = req.body;
		const button = await updateButton(parseInt(id as string), data);
		return res.status(200).json(button);
	} else if (req.method === 'DELETE') {
		const { id } = req.query;
		const button = await deleteButton(parseInt(id as string));
		return res.status(200).json(button);
	} else {
		return res.status(400).json({ message: 'Unsupported method' });
	}
}
