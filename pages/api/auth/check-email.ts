import { sendMail } from '@/utils/mailer';
import { generateOTP, getOTPEmailHtml } from '@/utils/tools';
import { PrismaClient, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export async function getUser(email: string) {
	const user = await prisma.user.findUnique({
		where: {
			email
		}
	});
	return user;
}

export async function createOTP(user: User) {
	const now = new Date();
	await prisma.userOTP.deleteMany({
		where: {
			user_id: user.id
		}
	});

	const code = generateOTP();
	await prisma.userOTP.create({
		data: {
			user_id: user.id,
			code,
			//15mn validity
			expiration_date: new Date(now.getTime() + 15 * 60 * 1000)
		}
	});

	await sendMail(
		'Votre mot de passe temporaire',
		user.email,
		getOTPEmailHtml(code),
		`Votre mot de passe temporaire valable 15 minutes : ${code}`
	);
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { email } = req.query;

	if (!email) res.status(400).json({ message: 'Missing email in query' });

	if (req.method === 'GET') {
		const user = await getUser(email as string);

		if (!user) res.status(404).json({ message: 'User not found' });
		else if (user.observatoire_account && !user.active) {
			createOTP(user);
			res.status(206).json({ message: 'User from observatoire not active' });
		} else if (!user.active)
			res.status(423).json({ message: "User isn't active" });
		else res.status(200).json({ message: 'User found' });
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
