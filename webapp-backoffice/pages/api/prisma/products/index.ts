import { PrismaClient, Product } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function getProducts(sort?: string, search?: string) {
	let orderBy: any = [
		{
			title: 'asc'
		}
	];
	let include: any = {};

	let where: any = {
		title: {
			contains: ''
		}
	};

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

	const products = await prisma.product.findMany({
		orderBy,
		where,
		//TO REMOVE, HANDLE PAGINATION
		take: 300,
		include: {
			buttons: true
		}
	});
	return products;
}

export async function getProduct(id: number) {
	const product = await prisma.product.findUnique({
		where: {
			id: id
		},
		include: {
			buttons: true
		}
	});
	return product;
}

export async function createProduct(
	data: Omit<Product, 'id'>,
	userEmail: string
) {
	const product = await prisma.product.create({
		data: data
	});

	await prisma.userProduct.create({
		data: {
			user_email: userEmail,
			product_id: product.id
		}
	});

	return product;
}

export async function updateProduct(id: number, data: Partial<Product>) {
	const product = await prisma.product.update({
		where: {
			id: id
		},
		data: data
	});
	return product;
}

export async function deleteProduct(id: number) {
	const product = await prisma.product.delete({
		where: {
			id: id
		}
	});
	return product;
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
		const { id, sort, search } = req.query;
		if (id) {
			const product = await getProduct(parseInt(id as string));
			res.status(200).json(product);
		} else {
			const products = await getProducts(sort as string, search as string);
			res.status(200).json(products);
		}
	} else if (req.method === 'POST') {
		const { userEmail } = req.query;
		const data = JSON.parse(req.body);
		const product = await createProduct(data, userEmail as string);
		res.status(201).json(product);
	} else if (req.method === 'PUT') {
		const { id } = req.query;

		const data = req.body;
		const product = await updateProduct(parseInt(id as string), data);
		res.status(200).json(product);
	} else if (req.method === 'DELETE') {
		const { id } = req.query;
		const product = await deleteProduct(parseInt(id as string));
		res.status(200).json(product);
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
