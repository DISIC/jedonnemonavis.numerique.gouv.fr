import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const deleteUserInputSchema = z.object({ id: z.number() });

export const deleteUserMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteUserInputSchema>;
}) => {
	const { id } = input;

	const deletedUser = await ctx.prisma.user.delete({
		where: { id }
	});

	return { data: deletedUser };
};
