import { renderOtpEmail, renderRegisterEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import {
	extractDomainFromEmail,
	generateRandomString
} from '@/src/utils/tools';
import { Prisma, PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';

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
	user: Prisma.UserCreateInput,
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

	const updatedUser = await prisma.user.update({
		where: {
			id: userOTP.user.id
		},
		data: {
			...user,
			email: user.email.toLowerCase()
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
	user: User
) {
	const userInvites = await prisma.accessRight.findMany({
		where: {
			user_email_invite: user.email.toLowerCase()
		}
	});

	if (userInvites.length > 0) {
		await prisma.accessRight.updateMany({
			where: {
				id: {
					in: userInvites.map(invite => invite.id)
				}
			},
			data: {
				user_email: user.email.toLowerCase()
			}
		});
	}

	const userInvitesEntity = await prisma.adminEntityRight.findMany({
		where: {
			user_email_invite: user.email.toLowerCase()
		}
	});

	if (userInvitesEntity.length > 0) {
		await prisma.adminEntityRight.updateMany({
			where: {
				id: {
					in: userInvitesEntity.map(invite => invite.id)
				}
			},
			data: {
				user_email: user.email.toLowerCase()
			}
		});
	}
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
