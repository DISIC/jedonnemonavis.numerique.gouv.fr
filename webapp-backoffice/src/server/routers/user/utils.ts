import {
	extractDomainFromEmail,
	generateRandomString
} from '@/src/utils/tools';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export function generateUnusablePassword() {
	return bcrypt.hashSync(generateRandomString(32), bcrypt.genSaltSync(10));
}

export async function makeRelationFromUserInvite(
	prisma: PrismaClient,
	email: string
) {
	const normalizedEmail = email.toLowerCase();

	const userInvites = await prisma.accessRight.findMany({
		where: { user_email_invite: normalizedEmail }
	});

	if (userInvites.length > 0) {
		await prisma.accessRight.updateMany({
			where: { id: { in: userInvites.map(invite => invite.id) } },
			data: { user_email: normalizedEmail }
		});
	}

	const userInvitesEntity = await prisma.adminEntityRight.findMany({
		where: { user_email_invite: normalizedEmail }
	});

	if (userInvitesEntity.length > 0) {
		await prisma.adminEntityRight.updateMany({
			where: { id: { in: userInvitesEntity.map(invite => invite.id) } },
			data: { user_email: normalizedEmail }
		});
	}
}

export function omitPassword<T extends { password?: string | null }>(
	user: T
): Omit<T, 'password'> {
	const { password: _password, ...rest } = user;
	return rest;
}

export async function checkUserDomain(prisma: PrismaClient, email: string) {
	const domain = extractDomainFromEmail(email.toLowerCase());
	if (!domain) return false;

	const domainWhiteListed = await prisma.whiteListedDomain.findFirst({
		where: { domain }
	});
	return !!domainWhiteListed || domain.endsWith('.gouv.fr');
}

export { bcrypt };
