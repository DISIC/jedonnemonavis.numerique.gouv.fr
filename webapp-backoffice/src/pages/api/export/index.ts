// pages/api/export.js
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export function exportData(req: NextApiRequest, res: NextApiResponse) {
	const { fileName } = req.query || '';

	const sanitizedName = path.basename(fileName as string);
	const filePath = path.join('/mnt/jdma/reviews', sanitizedName);

	if (!filePath.startsWith('/mnt/jdma/reviews/')) {
		return res.status(400).json({ msg: 'Invalid filename' });
	}

	const stat = fs.statSync(filePath);

	res.setHeader('Content-Length', stat.size);
	res.setHeader('Content-Type', 'application/octet-stream');
	res.setHeader('Content-Disposition', `attachment; filename=${sanitizedName}`);

	const readStream = fs.createReadStream(filePath);
	readStream.pipe(res);
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

	if (req.method === 'GET') {
		exportData(req, res);
	}
}
