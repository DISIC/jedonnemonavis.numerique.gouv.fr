import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export async function deleteUserOTP(id: number) {
	await prisma.userOTP.delete({
		where: {
			id
		}
	});
}

export async function getUserOTP(email: string, otp: string) {
	const userOTP = await prisma.userOTP.findUnique({
		where: {
			code: otp,
			user: {
				email: email
			}
		}
	});
	return userOTP;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { otp, email } = req.query;

	if (!otp || !email)
		return res
			.status(400)
			.json({ message: 'Missing params in query (otp, email)' });

	if (req.method === 'GET') {
		const userOTP = await getUserOTP(email as string, otp as string);

		if (!userOTP) return res.status(404).json({ message: 'Invalid OTP' });
		else {
			const now = new Date();
			deleteUserOTP(userOTP.id);
			if (now.getTime() > userOTP.expiration_date.getTime()) {
				return res.status(400).json({ message: 'Expired OTP' });
			} else {
				return res.status(200).json({ data: { id: userOTP.id } });
			}
		}
	}
}
