import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import {
	buildUserScopedKey,
	deleteMemoryValue,
	getMemoryValue
} from '@/src/utils/memoryStorage';
import prisma from '@/src/utils/db';

export async function exportData(
	req: NextApiRequest,
	res: NextApiResponse,
	userId: number
) {
	const memoryKey = req.query.memoryKey;
	if (typeof memoryKey !== 'string' || !memoryKey) {
		return res.status(400).json({ msg: 'Invalid memoryKey' });
	}
	const scopedKey = buildUserScopedKey(userId, memoryKey);
	const memoryValue = getMemoryValue(scopedKey);
	if (memoryValue === 100) {
		deleteMemoryValue(scopedKey);
	}
	res.status(201).json({ progress: memoryValue });
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const token = await getToken({
		req,
		secret: process.env.JWT_SECRET
	});
	if (!token || (token.exp as number) * 1000 < Date.now())
		return res.status(401).json({ msg: 'You shall not pass.' });

	const userEmail = ((token.email as string) || '').toLowerCase();
	if (!userEmail) {
		return res.status(401).json({ msg: 'You shall not pass.' });
	}

	const user = await prisma.user.findUnique({
		where: { email: userEmail }
	});

	if (!user) {
		return res.status(401).json({ msg: 'You shall not pass.' });
	}

	if (req.method === 'GET') {
		await exportData(req, res, user.id);
	}
}
