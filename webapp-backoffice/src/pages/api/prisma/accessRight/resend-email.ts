import { sendMail } from '@/src/utils/mailer';
import {
	generateRandomString,
	getUserInviteEmailHtml
} from '@/src/utils/tools';
import { PrismaClient } from '@prisma/client';
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
		const { user_email, product_id } = req.query;

		const userEmail = user_email as string;

		const product = await prisma.product.findUnique({
			where: {
				id: parseInt(product_id as string)
			}
		});

		if (!product) return res.status(404).json({ message: 'Product not found' });

		const token = await generateInviteToken(userEmail);

		await sendMail(
			'Invitation à rejoindre "Je donne mon avis"',
			userEmail,
			getUserInviteEmailHtml(userEmail, token, product.title),
			`Cliquez sur ce lien pour créer votre compte : ${
				process.env.NODEMAILER_BASEURL
			}/register?${new URLSearchParams({
				email: userEmail,
				inviteToken: token
			})}`
		);

		res.status(200).json({ message: 'Email sent' });
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
