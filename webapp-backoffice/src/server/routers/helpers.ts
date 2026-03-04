import { PrismaClient } from '@prisma/client';
import { generateRandomString } from '@/src/utils/tools';

/**
 * Creates an invite token for the given user email and persists it.
 * Shared by accessRight and adminEntityRight routers.
 */
export const generateInviteToken = async (
	prisma: PrismaClient,
	userEmail: string
): Promise<string> => {
	const token = generateRandomString(32);

	await prisma.userInviteToken.create({
		data: {
			user_email: userEmail.toLowerCase(),
			token
		}
	});

	return token;
};
