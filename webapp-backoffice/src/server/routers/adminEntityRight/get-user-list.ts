import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getAdminEntityRightUserListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1)
});

export const getAdminEntityRightUserListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getAdminEntityRightUserListInputSchema>;
}) => {
	const { numberPerPage, page } = input;

	const where: Prisma.AdminEntityRightWhereInput = {
		user: { id: parseInt(ctx.session.user.id) }
	};

	const adminEntityRights = await ctx.prisma.adminEntityRight.findMany({
		where,
		take: numberPerPage,
		skip: (page - 1) * numberPerPage
	});

	const count = await ctx.prisma.adminEntityRight.count({ where });

	return { data: adminEntityRights, metadata: { count } };
};
