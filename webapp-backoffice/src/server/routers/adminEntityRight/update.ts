import { AdminEntityRightUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const updateAdminEntityRightInputSchema =
	AdminEntityRightUncheckedUpdateInputSchema;

export const updateAdminEntityRightMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateAdminEntityRightInputSchema>;
}) => {
	const { id, ...data } = input;

	const adminEntityRight = await ctx.prisma.adminEntityRight.update({
		where: { id: id as number },
		data
	});

	return adminEntityRight;
};
