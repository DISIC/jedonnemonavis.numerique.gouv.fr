import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { assertAdminOrOwn, deleteUserRelations } from './utils';

export const deleteUserInputSchema = z.object({ id: z.number() });

export const deleteUserMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteUserInputSchema>;
}) => {
	const { id } = input;

	assertAdminOrOwn(ctx.session, id);

	const deletedUser = await ctx.prisma.$transaction(async tx => {
		await deleteUserRelations(tx, [id]);
		return tx.user.delete({ where: { id } });
	});

	return { data: deletedUser };
};
