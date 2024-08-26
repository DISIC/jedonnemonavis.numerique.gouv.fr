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

		await prisma.userResetToken.deleteMany({
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
		await prisma.userRequest.deleteMany({
			where: {
				user_email_copy: {
					startsWith: 'e2e-jdma-test'
				}
			}
		});

		await prisma.userInviteToken.deleteMany({
			where: {
				user_email: {
					startsWith: 'e2e-jdma-test'
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

		const productsTest = await prisma.product.findMany({
			where: {
				title: {
					startsWith: 'e2e-jdma-service-test'
				}
			}
		});

		const productIds = productsTest.map(product => product.id);

		await prisma.accessRight.deleteMany({
			where: {
				product_id: {
					in: productIds
				}
			}
		});

		const buttonsTest = await prisma.button.findMany({
			where: {
				product_id: {
					in: productIds
				}
			}
		});

		const buttonsIds = buttonsTest.map(button => button.id);

		const reviewsTest = await prisma.review.findMany({
			where: {
				button_id: {
					in: buttonsIds
				}
			}
		});

		const reviewsTestIds = reviewsTest.map(review => review.id);

		await prisma.answer.deleteMany({
			where: {
				review_id: {
					in: reviewsTestIds
				}
			}
		});

		await prisma.review.deleteMany({
			where: {
				button_id: {
					in: buttonsIds
				}
			}
		});

		await prisma.button.deleteMany({
			where: {
				id: {
					in: buttonsIds
				}
			}
		});

		await prisma.product.deleteMany({
			where: {
				id: {
					in: productIds
				}
			}
		});

		//DELETE TEST ENTITIES
		await prisma.adminEntityRight.deleteMany({
			where: {
				user_email_invite: {
					startsWith: 'e2e-jdma-test'
				}
			}
		});

		await prisma.entity.deleteMany({
			where: {
				name: {
					startsWith: 'e2e-jdma-entity-test'
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
