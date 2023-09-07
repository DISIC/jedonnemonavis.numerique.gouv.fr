import { sendMail } from '@/utils/mailer';
import { generateRandomString, getRegisterEmailHtml } from '@/utils/tools';
import { PrismaClient, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function userExists(email: string) {
	const tmpUser = await prisma.user.findFirst({ where: { email } });
	return !!tmpUser;
}

export async function activateUser(user: User) {
	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: { active: true }
	});
	return { ...updatedUser, password: 'Nice try!' };
}

export async function registerUser(user: Omit<User, 'id'>) {
	const newUser = await prisma.user.create({ data: user });
	return { ...newUser, password: 'Nice try!' };
}

export async function generateValidationToken(user: User) {
	const token = generateRandomString(32);
	await prisma.userValidationToken.create({
		data: {
			user_id: user.id,
			token
		}
	});

	return token;
}

export async function registerUserFromOTP(
	user: Omit<User, 'id' | 'email' | 'observatoire_account'>,
	otp_id: string
) {
	const userOTP = await prisma.userOTP.findUnique({
		where: {
			id: otp_id
		},
		include: {
			user: true
		}
	});

	if (!userOTP || !userOTP.user) return;

	await prisma.user.update({
		where: {
			id: userOTP.user.id
		},
		data: {
			...user
		}
	});

	return { ...user, password: 'Nice try!' };
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { firstName, lastName, email, password, otp_id } = req.body;

	if (!firstName || !lastName || !email || !password)
		return res.status(400).send('Some fields are missing');

	if (req.method === 'POST') {
		const hashedPassword = crypto
			.createHash('sha256')
			.update(password)
			.digest('hex');

		if (!!otp_id) {
			const user = await registerUserFromOTP(
				{
					firstName,
					lastName,
					password: hashedPassword,
					active: true
				},
				otp_id as string
			);

			return res.status(200).json({ user });
		} else {
			const hasConflict = await userExists(email);

			if (hasConflict) return res.status(409).send('User already exists');

			const user = await registerUser({
				firstName,
				lastName,
				email,
				password: hashedPassword,
				active: false,
				observatoire_account: false
			});

			if (!user)
				return res
					.status(500)
					.send('Internal server error while creating user');

			const token = await generateValidationToken(user);

			await sendMail(
				'Confirmez votre email',
				user.email,
				getRegisterEmailHtml(token),
				`Cliquez sur ce lien pour valider votre compte : ${
					process.env.NODEMAILER_BASEURL
				}/register/validate?${new URLSearchParams({ token })}`
			);

			return res.status(200).json({ user });
		}
	}
}
