import { PrismaClient, Product } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { ImportProduct } from './types';

const prisma = new PrismaClient();

export async function importProduct(data: ImportProduct) {
	const product = await prisma.product.upsert({
		where: {
			observatoire_id: data.observatoire_id
		},
		update: {},
		create: {
			title: data.title,
			observatoire_id: data.observatoire_id,
			buttons: { create: data.buttons },
			entity: {
				connectOrCreate: {
					where: { name: data.entity.name },
					create: data.entity
				}
			},
			accessRights: {
				create: data.users.map(user => ({
					status: 'carrier',
					user: {
						connectOrCreate: {
							where: { email: user.email },
							create: {
								...user,
								entities: {
									connectOrCreate: user.entities.map(e => ({
										where: { name: e.name },
										create: { ...e }
									}))
								}
							}
						}
					}
				}))
			}
		}
	});

	return product;
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
		const product = await importProduct(data);
		return res.status(201).json(product);
	}
}
