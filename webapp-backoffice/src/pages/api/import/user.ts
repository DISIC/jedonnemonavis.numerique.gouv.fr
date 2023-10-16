import { PrismaClient, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { UserWithEntities } from '@/src/types/prismaTypesExtended';

const prisma = new PrismaClient();

export async function importUser(data: UserWithEntities) {
	const user = await prisma.user.upsert({
		where: {
			email: data.email
		},
		update: {},
		create: {
			...data,
			entities: {
				connectOrCreate: data.entities.map(e => ({
					where: { name: e.name },
					create: { ...e }
				}))
			}
		}
	});

	return user;
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

	if (req.method === 'POST') {
		const data = JSON.parse(JSON.stringify(req.body));
		const user = await importUser(data);
		return res.status(201).json(user);
	}
}
