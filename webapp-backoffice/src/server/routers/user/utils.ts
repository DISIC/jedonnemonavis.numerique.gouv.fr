import { extractDomainFromEmail } from '@/src/utils/tools';
import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { Session } from 'next-auth';

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
