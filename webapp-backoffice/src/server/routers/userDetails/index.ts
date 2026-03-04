import { protectedProcedure, router } from '@/src/server/trpc';
import { getUserDetailsByUserQuery } from './get-by-user';
import {
	createUserDetailsInputSchema,
	createUserDetailsMutation
} from './create';

export const userDetailsRouter = router({
	getByUser: protectedProcedure.query(getUserDetailsByUserQuery),

	create: protectedProcedure
		.input(createUserDetailsInputSchema)
		.mutation(createUserDetailsMutation)
});
