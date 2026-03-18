import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getFavoriteByUserInputSchema = z.object({
	user_id: z.number()
});

export const getFavoriteByUserQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getFavoriteByUserInputSchema>;
}) => {
	const { user_id } = input;
	const userFavorites = await ctx.prisma.favorite.findMany({
		where: { user_id }
	});
	return { data: userFavorites };
};
