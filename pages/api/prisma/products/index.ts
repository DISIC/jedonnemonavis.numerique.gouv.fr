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

	let where: any = {
		title: {
			contains: ''
		}
	};

	if (search) {
		where = {
			title: {
				contains: search
			}
		};
	}

	if (sort) {
		const values = sort.split(':');
		if (values.length === 2) {
			orderBy = [
				{
					[values[0]]: values[1]
				}
			];
		}
	}

	const products = await prisma.product.findMany({
		orderBy,
		where
	});
	return products;
}

export async function getProduct(id: string) {
	const product = await prisma.product.findUnique({
		where: {
			id: id
		}
	});
	return product;
}

export async function createProduct(data: Omit<Product, 'id'>) {
	const product = await prisma.product.create({
		data: data
	});
	return product;
}

export async function updateProduct(id: string, data: Partial<Product>) {
	const product = await prisma.product.update({
		where: {
			id: id
		},
		data: data
	});
	return product;
}

export async function deleteProduct(id: string) {
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
			const product = await getProduct(id.toString());
			res.status(200).json(product);
		} else {
			const products = await getProducts(sort as string, search as string);
			res.status(200).json(products);
		}
	} else if (req.method === 'POST') {
		const data = JSON.parse(req.body);
		const product = await createProduct(data);
		res.status(201).json(product);
	} else if (req.method === 'PUT') {
		const { id } = req.query;

		const data = req.body;
		const product = await updateProduct(id as string, data);
		res.status(200).json(product);
	} else if (req.method === 'DELETE') {
		const { id } = req.query;
		const product = await deleteProduct(id as string);
		res.status(200).json(product);
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
