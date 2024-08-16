import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import cypress_env from '../../../../cypress.env.json';

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	const userPassword = cypress_env.user_password;

	const secretPassword = req.query.secretPassword as string;
	const defaultHashPassword =
		'c40ed7bca258c7d3b0d3e86832b7f502bdf8a044b352598c3146acaa94d5ba1d';

	if (secretPassword) {
		const hashedPassword = crypto
			.createHash('sha256')
			.update(secretPassword)
			.digest('hex');

		const hashedUserPassword = crypto
			.createHash('sha256')
			.update(userPassword)
			.digest('hex');

		try {
			if (hashedPassword === defaultHashPassword) {
				const createdUser = await prisma.user.create({
					data: {
						firstName: 'jdma-test',
						lastName: 'jdma-test',
						email: 'e2e-jdma-test-admin@beta.gouv.fr',
						active: true,
						password: hashedUserPassword,
						role: 'admin'
					}
				});

				res.status(200).json({
					message: `'User admin test with id ${createdUser.id} was created successfully'`
				});
			}
		} catch (error) {
			console.error('Error deleting users:', error);
			res.status(500).json({ error: 'Internal server error' });
		} finally {
			await prisma.$disconnect();
		}
	} else {
		res.status(400).json({ message: 'Password is required' });
	}
}
