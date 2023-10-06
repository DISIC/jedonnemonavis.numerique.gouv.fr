import { sendMail } from '@/utils/mailer';
import { generateRandomString, getInviteEmailHtml } from '@/utils/tools';
import { PrismaClient, Product } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function generateInviteToken(user_email: string) {
	const token = generateRandomString(32);
	await prisma.userInviteToken.create({
		data: {
			user_email,
			token
		}
	});

	return token;
}

export async function getUserProducts(
	numberPerPage: number,
	page: number,
	product_id: number,
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

export async function createUserProduct(userEmail: string, productId: number) {
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

	if (newUserProduct.user === null) {
		const token = await generateInviteToken(userEmail);

		await sendMail(
			'Invitation à rejoindre "Je donne mon avis"',
			userEmail,
			getInviteEmailHtml(userEmail, token),
			`Cliquez sur ce lien pour créer votre compte : ${
				process.env.NODEMAILER_BASEURL
			}/register?${new URLSearchParams({
				email: userEmail,
				inviteToken: token
			})}`
		);
	}

	return newUserProduct;
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
		const { sort, product_id, isRemoved, numberPerPage, page } = req.query;
		if (!numberPerPage || !page) {
			return res.status(400).json({ message: 'Missing numberPerPage or page' });
		}
		const userProducts = await getUserProducts(
			parseInt(numberPerPage as string, 10) as number,
			parseInt(page as string, 10) as number,
			parseInt(product_id as string),
			{ isRemoved: isRemoved === 'true' },
			sort as string
		);
		res.status(200).json(userProducts);
	} else if (req.method === 'POST') {
		const { product_id } = req.query;
		const data = JSON.parse(req.body);
		try {
			const userProduct = await createUserProduct(
				data.email as string,
				parseInt(product_id as string)
			);
			res.status(201).json(userProduct);
		} catch (error) {
			res.status(409).json({ message: '' });
		}
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
