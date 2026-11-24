import { extractDomainFromEmail } from '@/src/utils/tools';
import { Prisma, PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { Session } from 'next-auth';

export async function deleteUserRelations(
	prisma: Prisma.TransactionClient,
	userIds: number[]
) {
	const users = await prisma.user.findMany({
		where: { id: { in: userIds } },
		select: { email: true }
	});
	const emails = users.map(user => user.email);
	const normalizedEmails = emails.map(email => email.toLowerCase());
	const rightsWhere = {
		OR: [
			{ user_email: { in: emails } },
			{ user_email_invite: { in: normalizedEmails } }
		]
	};

	await prisma.favorite.deleteMany({ where: { user_id: { in: userIds } } });
	await prisma.accessRight.deleteMany({ where: rightsWhere });
	await prisma.adminEntityRight.deleteMany({ where: rightsWhere });
	await prisma.userInviteToken.deleteMany({
		where: { user_email: { in: normalizedEmails } }
	});
}

/** Contrôle « admin ou soi-même » sur l'input parsé de la procédure. */
export function assertAdminOrOwn(session: Session | null, id: number) {
	const isAdmin = !!session?.user?.role?.includes('admin');
	const isOwn =
		session?.user?.id !== undefined && Number(session.user.id) === id;

	if (!isAdmin && !isOwn)
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You are not authorized to perform this action'
		});
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
