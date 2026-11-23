import { PrismaClient } from '@prisma/client';
import { encode } from 'next-auth/jwt';
import { signInProConnectUser } from '../../src/server/utils/proconnect-account';

const prisma = new PrismaClient();

const SESSION_MAX_AGE = 24 * 60 * 60;

type SignInArg = {
	email: string;
	firstName?: string;
	lastName?: string;
};

const encodeSession = (email: string, acr: string | null) => {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT_SECRET is missing from the Cypress env');
	return encode({
		token: { email, ...(acr && { acr }) },
		secret,
		maxAge: SESSION_MAX_AGE
	});
};

export const authTasks = {
	'auth:signIn': async ({
		email,
		firstName,
		lastName
	}: SignInArg): Promise<string> => {
		const normalizedEmail = email.toLowerCase();
		const existingUser = await prisma.user.findUnique({
			where: { email: normalizedEmail }
		});

		if (!existingUser && (!firstName || !lastName)) {
			throw new Error(
				`No user ${normalizedEmail}: pass firstName and lastName to create it`
			);
		}

		const user = await signInProConnectUser(prisma, {
			email: normalizedEmail,
			firstName,
			lastName
		});
		if (!user) throw new Error(`User ${normalizedEmail} is deactivated`);

		return encodeSession(normalizedEmail, 'eidas2');
	},

	'auth:encodeSession': ({
		email,
		acr
	}: {
		email: string;
		acr: string | null;
	}): Promise<string> => encodeSession(email.toLowerCase(), acr)
};
