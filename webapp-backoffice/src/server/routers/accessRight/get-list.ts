import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getAccessRightListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	product_id: z.number(),
	isRemoved: z.boolean()
});

export const getAccessRightListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getAccessRightListInputSchema>;
}) => {
	const { numberPerPage, page, product_id, isRemoved } = input;

	const where: Prisma.AccessRightWhereInput = {
		product_id,
		status: isRemoved ? undefined : { in: ['carrier_user', 'carrier_admin'] }
	};

	const entities = await ctx.prisma.accessRight.findMany({
		where,
		take: numberPerPage,
		skip: (page - 1) * numberPerPage,
		include: { user: true }
	});

	const count = await ctx.prisma.accessRight.count({ where });

	return { data: entities, metadata: { count } };
};
