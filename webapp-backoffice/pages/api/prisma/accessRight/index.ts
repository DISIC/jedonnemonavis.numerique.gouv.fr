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

export async function getAccessRights(
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

	const accessRights = await prisma.accessRight.findMany({
		orderBy,
		where,
		take: numberPerPage,
		skip: numberPerPage * (page - 1),
		include: {
			user: true
		}
	});

	const count = await prisma.accessRight.count({ where });

	return { data: accessRights, count };
}

export async function checkIfAccessRightExists(
	userEmail: string,
	productId: number
) {
	return await prisma.accessRight.findFirst({
		where: {
			user_email: userEmail,
			product_id: productId
		}
	});
}

export async function checkIfUserExists(userEmail: string) {
	return await prisma.user.findFirst({
		where: {
			email: userEmail
		}
	});
}

export async function createAccessRight(
	userEmail: string,
	productId: number,
	userExists: boolean
) {
	const newAccessRight = await prisma.accessRight.create({
		data: {
			user_email: userExists ? userEmail : null,
			user_email_invite: !userExists ? userEmail : null,
			product_id: productId
		},
		include: {
			user: true
		}
	});

	if (newAccessRight.user === null) {
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

	return newAccessRight;
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
		const accessRights = await getAccessRights(
			parseInt(numberPerPage as string, 10) as number,
			parseInt(page as string, 10) as number,
			parseInt(product_id as string),
			{ isRemoved: isRemoved === 'true' },
			sort as string
		);
		return res.status(200).json(accessRights);
	} else if (req.method === 'POST') {
		const { product_id } = req.query;
		const data = JSON.parse(req.body);

		const accessRightAlreadyExists = await checkIfAccessRightExists(
			data.email as string,
			parseInt(product_id as string)
		);

		if (accessRightAlreadyExists !== null)
			return res.status(409).json({ message: 'Access Right already exists' });

		const user = await checkIfUserExists(data.email as string);

		const accessRight = await createAccessRight(
			data.email as string,
			parseInt(product_id as string),
			user !== null
		);
		return res.status(201).json(accessRight);
	} else {
		return res.status(400).json({ message: 'Unsupported method' });
	}
}
