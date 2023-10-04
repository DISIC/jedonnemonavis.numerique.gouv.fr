import { PrismaClient, Product } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function getUserProducts(
	numberPerPage: number,
	page: number,
	product_id: string,
	sort?: string
) {
	let orderBy: any = [
		{
			status: 'asc'
		}
	];
	let include: any = {};

	let where: any = {
		product_id
	};

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

	const userProducts = await prisma.userProduct.findMany({
		orderBy,
		where,
		take: numberPerPage,
		skip: numberPerPage * (page - 1),
		include: {
			user: true
		}
	});

	const count = await prisma.userProduct.count({ where });

	return { data: userProducts, count };
}

export async function getProduct(id: string) {
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
		const { id, sort, product_id, numberPerPage, page } = req.query;
		if (id) {
			const product = await getProduct(id.toString());
			res.status(200).json(product);
		} else {
			if (!numberPerPage || !page) {
				return res
					.status(400)
					.json({ message: 'Missing numberPerPage or page' });
			}
			const userProducts = await getUserProducts(
				parseInt(numberPerPage as string, 10) as number,
				parseInt(page as string, 10) as number,
				product_id as string,
				sort as string
			);
			res.status(200).json(userProducts);
		}
	} else if (req.method === 'POST') {
		const { userEmail } = req.query;
		const data = JSON.parse(req.body);
		const product = await createProduct(data, userEmail as string);
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
