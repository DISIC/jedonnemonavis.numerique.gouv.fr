import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const deleteManyUsersInputSchema = z.object({
	ids: z.array(z.number())
});

export const deleteManyUsersMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteManyUsersInputSchema>;
}) => {
	const { ids } = input;

	const deletedUser = await ctx.prisma.user.deleteMany({
		where: { id: { in: ids } }
	});

	return { data: deletedUser };
};
