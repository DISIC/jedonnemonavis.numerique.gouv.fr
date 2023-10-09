import { sendMail } from '@/utils/mailer';
import { generateRandomString, getInviteEmailHtml } from '@/utils/tools';
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
		const { user_email } = req.query;

		const userEmail = user_email as string;

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

		res.status(200).json({ message: 'Email sent' });
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
