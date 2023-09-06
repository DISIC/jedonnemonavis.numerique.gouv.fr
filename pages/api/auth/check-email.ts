import { PrismaClient } from '@prisma/client';
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
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { email } = req.query;

	if (!email) res.status(400).json({ message: 'Missing email in query' });

	if (req.method === 'GET') {
		const user = await getUser(email as string);

		if (!user) res.status(404).json({ message: 'User not found' });
		else if (user.observatoire_account && !user.active)
			res.status(206).json({ message: 'User from observatoire not active' });
		else if (!user.active)
			res.status(423).json({ message: "User isn't active" });
		else res.status(200).json({ message: 'User found' });
	} else {
		res.status(400).json({ message: 'Unsupported method' });
	}
}
