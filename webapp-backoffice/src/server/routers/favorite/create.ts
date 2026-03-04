import { FavoriteUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const createFavoriteInputSchema = FavoriteUncheckedCreateInputSchema;

export const createFavoriteMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createFavoriteInputSchema>;
}) => {
	const favorite = await ctx.prisma.favorite.create({ data: input });
	return { data: favorite };
};
