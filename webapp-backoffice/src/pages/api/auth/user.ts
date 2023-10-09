import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export async function getUser(email: string) {
	const user = await prisma.user.findUnique({
		where: {
			email
		}
	});
	return user;
}

export async function getUserInfosFromOTP(otp: string) {
	const userOTP = await prisma.userOTP.findUnique({
		where: {
			code: otp
		},
		include: {
			user: true
		}
	});

	return {
		email: userOTP?.user.email,
		firstName: userOTP?.user.firstName,
		lastName: userOTP?.user.lastName
	};
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { otp } = req.query;

	if (req.method === 'GET') {
		if (otp) {
			const userInfos = await getUserInfosFromOTP(otp as string);

			if (!userInfos) return res.status(404).send('User not found from OTP');

			return res.status(200).json({ user: userInfos });
		} else {
			const session = await getSession({ req });

			if (!session) {
				return res.status(401).send('Unauthorized');
			}

			if (!session.user) {
				return res.status(404).send('User not found from session');
			}

			const user = await getUser(session.user.email as string);

			if (!user) {
				return res.status(404).send('User not found in database');
			}

			return res.status(200).json({ user });
		}
	}
}
