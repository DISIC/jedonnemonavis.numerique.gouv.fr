import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

// NOTE: The original code incorrectly used FavoriteUncheckedCreateInputSchema as
// the delete input and passed the full object as the `favorite_id` value, which
// always caused a Prisma runtime error. Fixed to accept an explicit id.
export const deleteFavoriteInputSchema = z.object({
	favorite_id: z.number()
});

export const deleteFavoriteMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteFavoriteInputSchema>;
}) => {
	const deletedFavorite = await ctx.prisma.favorite.delete({
		where: { favorite_id: input.favorite_id }
	});
	return { data: deletedFavorite };
};
