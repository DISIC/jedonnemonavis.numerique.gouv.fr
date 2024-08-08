import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'DELETE') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const users = await prisma.user.findMany({
			where: {
				email: {
					startsWith: 'e2e-jdma-test'
				}
			},
			select: {
				id: true
			}
		});

		const userIds = users.map(user => user.id);

		await prisma.userValidationToken.deleteMany({
			where: {
				user_id: {
					in: userIds
				}
			}
		});

		await prisma.apiKey.deleteMany({
			where: {
				user_id: {
					in: userIds
				}
			}
		});

		await prisma.accessRight.deleteMany({
			where: {
				user_email: {
					startsWith: 'e2e-jdma-test'
				}
			}
		});

		const deleteResult = await prisma.user.deleteMany({
			where: {
				id: {
					in: userIds
				}
			}
		});

		res.status(200).json({
			message:
				'Users and associated tokens and accessRights deleted successfully',
			count: deleteResult.count
		});
	} catch (error) {
		console.error('Error deleting users:', error);
		res.status(500).json({ error: 'Internal server error' });
	} finally {
		await prisma.$disconnect();
	}
}
