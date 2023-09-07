import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { activateUser } from './register';

const prisma = new PrismaClient();

export async function deleteUserValidationToken(id: string) {
	await prisma.userValidationToken.delete({
		where: {
			id
		}
	});
}

export async function getUserValidationToken(token: string) {
	const userValidationToken = await prisma.userValidationToken.findUnique({
		where: {
			token
		},
		include: {
			user: true
		}
	});
	return userValidationToken;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { token } = req.query;

	if (!token)
		return res.status(400).json({ message: 'Missing token in query' });

	if (req.method === 'GET') {
		const userValidationToken = await getUserValidationToken(token as string);

		if (!userValidationToken)
			return res.status(404).json({ message: 'Invalid token' });
		else {
			const updatedUser = await activateUser(userValidationToken.user);

			if (!updatedUser)
				return res
					.status(500)
					.send('Internal server error while activating user');

			await deleteUserValidationToken(userValidationToken.id);

			return res.status(200).json({ user: updatedUser });
		}
	}
}
