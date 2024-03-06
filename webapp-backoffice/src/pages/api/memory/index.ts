// pages/api/memory.js
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { deleteMemoryValue, getMemoryValue } from '@/src/utils/memoryStorage';

export function exportData(req: NextApiRequest, res: NextApiResponse) {
    const memoryKey = req.query.memoryKey
	const memoryValue = getMemoryValue(memoryKey as string)
	if(memoryValue === 100) {
		deleteMemoryValue(memoryKey as string)
		console.log('memory value deleted')
	}
    res.status(201).json({progress : memoryValue})
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const token = await getToken({
		req,
		secret: process.env.JWT_SECRET
	});
	if (!token || (token.exp as number) > new Date().getTime())
		return res.status(401).json({ msg: 'You shall not pass.' });

	if (req.method === 'GET') {
		exportData(req, res);
	}
}