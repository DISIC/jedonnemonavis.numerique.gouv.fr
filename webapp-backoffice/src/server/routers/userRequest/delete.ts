import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const deleteUserRequestInputSchema = z.object({ id: z.number() });

export const deleteUserRequestMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteUserRequestInputSchema>;
}) => {
	const { id } = input;

	const deletedUserRequest = await ctx.prisma.userRequest.delete({
		where: { id }
	});

	return { data: deletedUserRequest };
};
