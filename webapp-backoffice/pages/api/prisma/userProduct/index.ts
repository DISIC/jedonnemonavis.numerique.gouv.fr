import { PrismaClient, Product } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function getUserProducts(
	numberPerPage: number,
	page: number,
	product_id: string,
	options: {
		isRemoved?: boolean;
	},
	sort?: string
) {
	let { isRemoved } = options;

	let orderBy: any = [
		{
			status: 'asc'
		}
	];
	let include: any = {};

	let where: any = {
		product_id,
		status: !isRemoved ? 'carrier' : undefined
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

export async function getUserProduct(id: string) {
	const userProduct = await prisma.userProduct.findUnique({
		where: {
			id: id
		}
	});
	return userProduct;
}

export async function createUserProduct(userEmail: string, productId: string) {
	const checkIfUserProductExists = await prisma.userProduct.findFirst({
		where: {
			user_email: userEmail,
			product_id: productId
		}
	});

	if (checkIfUserProductExists) {
		throw new Error('User product already exists');
	}

	const newUserProduct = await prisma.userProduct.create({
		data: {
			user_email: userEmail,
			product_id: productId
		},
		include: {
			user: true
		}
	});

	return newUserProduct;
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
		const { id, sort, product_id, isRemoved, numberPerPage, page } = req.query;
		if (id) {
			const product = await getUserProduct(id.toString());
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
				{ isRemoved: isRemoved === 'true' },
				sort as string
			);
			res.status(200).json(userProducts);
		}
	} else if (req.method === 'POST') {
		const { product_id } = req.query;
		const data = JSON.parse(req.body);
		try {
			const userProduct = await createUserProduct(
				data.email as string,
				product_id as string
			);
			res.status(201).json(userProduct);
		} catch (error) {
			res.status(409).json({ message: '' });
		}
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
