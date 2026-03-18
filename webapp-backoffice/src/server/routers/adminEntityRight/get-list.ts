import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getAdminEntityRightListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	entity_id: z.number()
});

export const getAdminEntityRightListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getAdminEntityRightListInputSchema>;
}) => {
	const { numberPerPage, page, entity_id } = input;

	const where: Prisma.AdminEntityRightWhereInput = { entity_id };

	const entities = await ctx.prisma.adminEntityRight.findMany({
		where,
		take: numberPerPage,
		skip: (page - 1) * numberPerPage,
		include: { user: true }
	});

	const count = await ctx.prisma.adminEntityRight.count({ where });

	return { data: entities, metadata: { count } };
};
