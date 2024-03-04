// pages/api/download.js
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export function exportData(req: NextApiRequest, res: NextApiResponse) {
  const { fileName } = req.query || ''; 

  const filePath = path.resolve('/mnt/jdma/reviews', fileName as string); 
  const stat = fs.statSync(filePath);
  
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  
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

	if (req.method === 'GET') {
		exportData(req, res);
	}
}