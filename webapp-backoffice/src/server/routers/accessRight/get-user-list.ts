import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getAccessRightUserListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1)
});

export const getAccessRightUserListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getAccessRightUserListInputSchema>;
}) => {
	const { numberPerPage, page } = input;

	const where: Prisma.AccessRightWhereInput = {
		user_email: ctx.session.user.email
	};

	const accessRights = await ctx.prisma.accessRight.findMany({
		where,
		take: numberPerPage,
		skip: (page - 1) * numberPerPage,
		include: { user: true }
	});

	const count = await ctx.prisma.accessRight.count({ where });

	return { data: accessRights, metadata: { count } };
};
