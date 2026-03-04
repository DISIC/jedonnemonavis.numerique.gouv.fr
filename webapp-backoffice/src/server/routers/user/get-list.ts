import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getUserListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	sort: z.string().optional(),
	search: z.string().optional(),
	entities: z.array(z.number()).optional(),
	onlyAdmins: z.boolean().optional()
});

export const getUserListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getUserListInputSchema>;
}) => {
	const { numberPerPage, page, sort, search, entities, onlyAdmins } = input;

	let orderBy: Prisma.UserOrderByWithAggregationInput[] = [
		{
			email: 'asc'
		}
	];

	let where: Prisma.UserWhereInput = {
		OR: [
			{
				UserRequests: {
					some: {
						status: 'accepted'
					}
				}
			},
			{
				UserRequests: {
					none: {}
				}
			}
		]
	};

	if (search) {
		if (search.includes(' ')) {
			const [firstName, lastName] = search.toLowerCase().split(' ');
			where.OR = [
				{
					firstName: { contains: firstName, mode: 'insensitive' },
					lastName: { contains: lastName, mode: 'insensitive' }
				},
				{
					firstName: { contains: lastName, mode: 'insensitive' },
					lastName: { contains: firstName, mode: 'insensitive' }
				}
			];
		} else {
			where.OR = [
				{
					firstName: { contains: search, mode: 'insensitive' }
				},
				{
					lastName: { contains: search, mode: 'insensitive' }
				},
				{
					email: { contains: search, mode: 'insensitive' }
				}
			];
		}
	}

	if (entities && entities.length > 0) {
		where.AND = [
			{
				OR: [
					{
						adminEntityRights: {
							some: {
								entity_id: { in: entities }
							}
						}
					},
					{
						accessRights: {
							some: {
								product: {
									entity_id: { in: entities }
								}
							}
						}
					}
				]
			}
		];
	}

	if (onlyAdmins) {
		where.role = {
			in: ['admin', 'superadmin']
		};
	}

	if (sort) {
		const values = sort.split(':');
		if (values.length === 2) {
			if (values[0].includes('.')) {
				const subValues = values[0].split('.');
				if (subValues.length === 2) {
					orderBy = [
						{
							[subValues[0]]: {
								[subValues[1]]: values[1]
							}
						}
					];
				}
			} else {
				orderBy = [
					{
						[values[0]]: values[1]
					}
				];
			}
		}
	}

	const users = await ctx.prisma.user.findMany({
		orderBy,
		where,
		take: numberPerPage,
		skip: numberPerPage * (page - 1)
	});

	const count = await ctx.prisma.user.count({ where });

	return { data: users, metadata: { count } };
};
