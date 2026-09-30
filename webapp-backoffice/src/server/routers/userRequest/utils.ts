import {
	renderUserRequestAcceptedEmail,
	renderUserRequestRefusedEmail
} from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { Prisma, PrismaClient, RequestMode } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { generateValidationToken, makeRelationFromUserInvite } from '../user';
import type { CreateUserRequestUserInput } from './create';

export async function createUserRequest(
	prisma: PrismaClient,
	user: CreateUserRequestUserInput,
	userRequest: { reason: string; mode: RequestMode; inviteToken?: string }
) {
	const email = user.email.toLowerCase();

	if (userRequest.inviteToken) {
		const userInviteToken = await prisma.userInviteToken.findUnique({
			where: {
				token: userRequest.inviteToken,
				user_email: email
			}
		});

		if (!userInviteToken)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Invite token not found for this user'
			});
	}

	const salt = bcrypt.genSaltSync(10);
	const hashedPassword = bcrypt.hashSync(user.password, salt);

	const createdUser = await prisma.user.create({
		data: {
			email,
			firstName: user.firstName,
			lastName: user.lastName,
			password: hashedPassword,
			role: 'user',
			active: false,
			xwiki_account: false,
			notifications: true,
			notifications_frequency: 'weekly'
		}
	});

	const createdUserRequest = prisma.userRequest.create({
		data: {
			reason: userRequest.reason,
			mode: userRequest.mode,
			user_id: createdUser.id,
			user_email_copy: createdUser.email.toLowerCase()
		}
	});

	if (userRequest.inviteToken) {
		await makeRelationFromUserInvite(prisma, createdUser.email);
	}

	return createdUserRequest;
}

export async function updateUserRequest(
	prisma: PrismaClient,
	id: number,
	userRequest: Prisma.UserRequestUpdateInput,
	createDomain: boolean,
	message?: string
) {
	const updatedUserRequest = await prisma.userRequest.update({
		where: { id },
		data: userRequest,
		include: {
			user: true
		}
	});

	if (updatedUserRequest.user !== null) {
		if (updatedUserRequest.status === 'accepted') {
			const foundUser = await prisma.user.findFirst({
				where: { id: updatedUserRequest.user.id }
			});

			const token = await generateValidationToken(
				prisma,
				updatedUserRequest.user.id
			);

			if (createDomain) {
				const newDomain = updatedUserRequest.user.email
					.toLowerCase()
					.split('@')[1];
				await prisma.whiteListedDomain.upsert({
					where: { domain: newDomain },
					create: { domain: newDomain },
					update: {}
				});
			}

			if (foundUser) {
				const emailHtml = await renderUserRequestAcceptedEmail({
					token,
					baseUrl: process.env.NODEMAILER_BASEURL
				});

				await sendMail(
					`Votre demande d'accès sur « Je donne mon avis » a été acceptée`,
					foundUser?.email.toLowerCase(),
					emailHtml,
					`Cliquez sur ce lien pour valider votre compte : ${
						process.env.NODEMAILER_BASEURL
					}/register/validate?${new URLSearchParams({ token })}`
				);
			}
		} else if (updatedUserRequest.status === 'refused') {
			await prisma.userRequest.update({
				where: { id },
				data: { user_id: null }
			});

			await prisma.user.delete({
				where: { id: updatedUserRequest.user.id }
			});

			const emailHtml = await renderUserRequestRefusedEmail({
				message,
				baseUrl: process.env.NODEMAILER_BASEURL
			});

			await sendMail(
				`Votre demande d'accès sur « Je donne mon avis » a été refusée`,
				updatedUserRequest.user.email.toLowerCase(),
				emailHtml,
				`Votre demande d'accès a été refusée${
					message ? ` pour la raison suivante : ${message}` : '.'
				}`
			);
		}
	}

	return updatedUserRequest;
}
