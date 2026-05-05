// pages/api/export.js
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '@/src/utils/db';

const REVIEWS_ROOT = '/mnt/jdma/reviews';

export async function exportData(
	req: NextApiRequest,
	res: NextApiResponse,
	allowedFileName: string
) {
	const filePath = path.join(REVIEWS_ROOT, allowedFileName);

	let resolvedPath: string;
	let resolvedRoot: string;
	try {
		resolvedPath = fs.realpathSync(filePath);
		resolvedRoot = fs.realpathSync(REVIEWS_ROOT);
	} catch {
		return res.status(404).json({ msg: 'Not found' });
	}

	if (
		resolvedPath !== resolvedRoot &&
		!resolvedPath.startsWith(resolvedRoot + path.sep)
	) {
		return res.status(400).json({ msg: 'Invalid filename' });
	}

	let stat: fs.Stats;
	try {
		stat = fs.statSync(resolvedPath);
	} catch {
		return res.status(404).json({ msg: 'Not found' });
	}

	res.setHeader('Content-Length', stat.size);
	res.setHeader('Content-Type', 'application/octet-stream');
	res.setHeader(
		'Content-Disposition',
		`attachment; filename="${allowedFileName.replace(/"/g, '')}"`
	);

	const readStream = fs.createReadStream(resolvedPath);
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

	if (req.method !== 'GET') {
		return res.status(405).json({ msg: 'Method not allowed' });
	}

	const { fileName } = req.query;
	if (typeof fileName !== 'string' || !fileName) {
		return res.status(400).json({ msg: 'Invalid filename' });
	}

	const sanitizedName = path.basename(fileName);
	if (sanitizedName !== fileName || sanitizedName.startsWith('.')) {
		return res.status(400).json({ msg: 'Invalid filename' });
	}

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

	const isAdmin = user.role.includes('admin');

	if (!isAdmin) {
		const ownExport = await prisma.export.findFirst({
			where: {
				user_id: user.id,
				link: { contains: sanitizedName }
			}
		});

		if (!ownExport) {
			return res.status(403).json({ msg: 'Forbidden' });
		}
	}

	return exportData(req, res, sanitizedName);
}
