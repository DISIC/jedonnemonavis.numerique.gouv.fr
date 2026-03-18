import { AccessRightUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const updateAccessRightInputSchema =
	AccessRightUncheckedUpdateInputSchema;

export const updateAccessRightMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateAccessRightInputSchema>;
}) => {
	const { id, ...data } = input;

	const accessRight = await ctx.prisma.accessRight.update({
		where: { id: id as number },
		data
	});

	return accessRight;
};
