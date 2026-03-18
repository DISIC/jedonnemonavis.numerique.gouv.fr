import { FavoriteUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const deleteFavoriteInputSchema = FavoriteUncheckedCreateInputSchema;

export const deleteFavoriteMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteFavoriteInputSchema>;
}) => {
	const deletedFavorites = await ctx.prisma.favorite.deleteMany({
		where: {
			user_id: input.user_id,
			product_id: input.product_id
		}
	});
	return { data: deletedFavorites };
};
