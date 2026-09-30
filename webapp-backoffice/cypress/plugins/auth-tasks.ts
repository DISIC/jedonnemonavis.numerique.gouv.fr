import { PrismaClient } from '@prisma/client';
import { encode } from 'next-auth/jwt';

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

		await prisma.user.upsert({
			where: { email: normalizedEmail },
			update: { proconnect_account: true, active: true },
			create: {
				email: normalizedEmail,
				firstName,
				lastName,
				password: 'unused',
				role: 'user',
				active: true,
				proconnect_account: true,
				notifications: true,
				notifications_frequency: 'weekly'
			}
		});

		await prisma.accessRight.updateMany({
			where: { user_email_invite: normalizedEmail },
			data: { user_email: normalizedEmail }
		});
		await prisma.adminEntityRight.updateMany({
			where: { user_email_invite: normalizedEmail },
			data: { user_email: normalizedEmail }
		});

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
