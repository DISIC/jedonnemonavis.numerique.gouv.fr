import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { FavoriteUncheckedCreateInputSchema } from '@/prisma/generated/zod';

export const favoriteRouter = router({
	getByUser: protectedProcedure
		.input(z.object({ user_id: z.number() }))
		.query(async ({ ctx, input }) => {
			const { user_id } = input;

			const userFavorites = await ctx.prisma.favorite.findMany({
				where: {
					user_id
				}
			});

			return { data: userFavorites };
		}),

	create: protectedProcedure
		.input(FavoriteUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const favorite = await ctx.prisma.favorite.create({
				data: input
			});

			return { data: favorite };
		}),

	delete: protectedProcedure
		.input(FavoriteUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const deletedFavorite = await ctx.prisma.favorite.delete({
				where: {
					favorite_id: input
				}
			});

			return { data: deletedFavorite };
		})
});
