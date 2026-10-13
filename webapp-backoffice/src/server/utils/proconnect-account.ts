import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

type ProConnectIdentity = {
	email: string;
	firstName?: string;
	lastName?: string;
};

export function generateUnusablePassword() {
	return bcrypt.hashSync(
		crypto.randomBytes(32).toString('hex'),
		bcrypt.genSaltSync(10)
	);
}

export async function makeRelationFromUserInvite(
	prisma: PrismaClient,
	email: string
) {
	const normalizedEmail = email.toLowerCase();

	await prisma.accessRight.updateMany({
		where: { user_email_invite: normalizedEmail },
		data: { user_email: normalizedEmail }
	});

	await prisma.adminEntityRight.updateMany({
		where: { user_email_invite: normalizedEmail },
		data: { user_email: normalizedEmail }
	});
}

async function findOrCreateProConnectUser(
	prisma: PrismaClient,
	{ email, firstName, lastName }: ProConnectIdentity
): Promise<User | null> {
	const user = await prisma.user.findUnique({ where: { email } });

	if (!user) {
		return prisma.user.create({
			data: {
				email,
				firstName,
				lastName,
				role: 'user',
				password: generateUnusablePassword(),
				notifications: true,
				notifications_frequency: 'weekly',
				active: true,
				xwiki_account: false,
				xwiki_username: null,
				proconnect_account: true
			}
		});
	}

	if (user.proconnect_account) return user.active ? user : null;

	return prisma.user.update({
		where: { id: user.id },
		data: { proconnect_account: true, active: true }
	});
}

export async function signInProConnectUser(
	prisma: PrismaClient,
	identity: ProConnectIdentity
): Promise<User | null> {
	const email = identity.email.toLowerCase();
	const user = await findOrCreateProConnectUser(prisma, { ...identity, email });
	if (!user) return null;

	await makeRelationFromUserInvite(prisma, email);

	await prisma.userEvent.create({
		data: {
			user_id: user.id,
			action: 'user_signin',
			created_at: new Date(),
			metadata: {}
		}
	});

	return user;
}
