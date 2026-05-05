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

	const actor = ctx.session?.user?.email
		? await ctx.prisma.user.findUnique({
				where: { email: ctx.session.user.email }
		  })
		: null;

	const deletedUser = await ctx.prisma.user.deleteMany({
		where: { id: { in: ids } }
	});

	if (actor) {
		await ctx.prisma.userEvent.create({
			data: {
				user_id: actor.id,
				action: 'api_call',
				metadata: {
					operation: 'user_delete_many',
					target_ids: ids,
					deleted_count: deletedUser.count
				}
			}
		});
	}

	return { data: deletedUser };
};
