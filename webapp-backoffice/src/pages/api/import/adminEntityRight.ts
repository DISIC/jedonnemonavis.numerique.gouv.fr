import { PrismaClient, AdminEntityRight } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { ImportAdminEntityRight } from './types';

const prisma = new PrismaClient();

export async function importAdminEntityRight(data: ImportAdminEntityRight) {
	const entity = await prisma.entity.findFirst({
		where: {
			name: data.entity_name
		}
	});

	if (!!entity) {
		const adminEntityRight = await prisma.adminEntityRight.create({
			data: {
				entity_id: entity.id,
				user_email: data.user_email
			}
		});

		return adminEntityRight;
	}

	return {};
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const token = await getToken({
		req,
		secret: process.env.JWT_SECRET
	});
	// if (!token || (token.exp as number) > new Date().getTime())
	// 	return res.status(401).json({ msg: 'You shall not pass.' });

	if (req.method === 'POST') {
		const data = JSON.parse(JSON.stringify(req.body));
		const adminEntityRight = await importAdminEntityRight(data);
		return res.status(201).json(adminEntityRight);
	}
}
