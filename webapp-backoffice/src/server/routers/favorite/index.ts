import { protectedProcedure, router } from '@/src/server/trpc';
import {
	getFavoriteByUserInputSchema,
	getFavoriteByUserQuery
} from './get-by-user';
import { createFavoriteInputSchema, createFavoriteMutation } from './create';
import { deleteFavoriteInputSchema, deleteFavoriteMutation } from './delete';

export const favoriteRouter = router({
	getByUser: protectedProcedure
		.input(getFavoriteByUserInputSchema)
		.query(getFavoriteByUserQuery),

	create: protectedProcedure
		.input(createFavoriteInputSchema)
		.mutation(createFavoriteMutation),

	delete: protectedProcedure
		.input(deleteFavoriteInputSchema)
		.mutation(deleteFavoriteMutation)
});
