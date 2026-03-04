import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const deleteAccessRightInputSchema = z.object({
	access_right_id: z.number()
});

export const deleteAccessRightMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteAccessRightInputSchema>;
}) => {
	const { access_right_id } = input;

	const accessRightDelete = await ctx.prisma.accessRight.delete({
		where: { id: access_right_id }
	});

	return accessRightDelete;
};
