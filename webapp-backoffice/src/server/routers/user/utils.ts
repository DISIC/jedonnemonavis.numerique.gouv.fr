import { renderOtpEmail, renderRegisterEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import {
	extractDomainFromEmail,
	generateRandomString
} from '@/src/utils/tools';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { Session } from 'next-auth';

export async function createOTP(prisma: PrismaClient, user: User) {
	const now = new Date();
	await prisma.userOTP.deleteMany({
		where: {
			user_id: user.id
		}
	});

	const code = generateRandomString();
	await prisma.userOTP.create({
		data: {
			user_id: user.id,
			code,
			//60mn validity
			expiration_date: new Date(now.getTime() + 60 * 60 * 1000)
		}
	});
	const emailHtml = await renderOtpEmail({
		code,
		baseUrl: process.env.NODEMAILER_BASEURL
	});

	await sendMail(
		'Votre mot de passe temporaire',
		user.email.toLowerCase(),
		emailHtml,
		`Votre mot de passe temporaire valable 60 minutes : ${code}`
	);
}

export async function registerUserFromOTP(
	prisma: PrismaClient,
	user: {
		firstName?: string;
		lastName?: string;
		email: string;
		password: string;
	},
	otp: string
) {
	const userOTP = await prisma.userOTP.findUnique({
		where: {
			code: otp
		},
		include: {
			user: true
		}
	});

	if (!userOTP || !userOTP.user) return;

	if (
		!user.email ||
		user.email.toLowerCase() !== userOTP.user.email.toLowerCase()
	) {
		return;
	}

	if (userOTP.expiration_date < new Date()) {
		return;
	}

	const updatedUser = await prisma.user.update({
		where: {
			id: userOTP.user.id
		},
		data: {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email.toLowerCase(),
			password: user.password,
			active: true,
			xwiki_account: true
		}
	});

	await prisma.userOTP.delete({
		where: {
			code: otp
		}
	});

	return { ...updatedUser, password: 'Nice try!' };
}

export async function updateUser(
	prisma: PrismaClient,
	userId: number,
	user: Prisma.UserUpdateInput
) {
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: { ...user }
	});
	return { ...updatedUser, password: 'Nice try!' };
}

export async function generateValidationToken(
	prisma: PrismaClient,
	userId: number
) {
	await prisma.userValidationToken.deleteMany({
		where: { user_id: userId }
	});

	const token = generateRandomString(32);
	await prisma.userValidationToken.create({
		data: {
			user_id: userId,
			token
		}
	});

	return token;
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
			data: { user_email: normalizedEmail, user_email_invite: null }
		});
	}

	const userInvitesEntity = await prisma.adminEntityRight.findMany({
		where: { user_email_invite: normalizedEmail }
	});

	if (userInvitesEntity.length > 0) {
		await prisma.adminEntityRight.updateMany({
			where: { id: { in: userInvitesEntity.map(invite => invite.id) } },
			data: { user_email: normalizedEmail, user_email_invite: null }
		});
	}
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
