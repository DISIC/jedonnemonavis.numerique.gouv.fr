import { protectedProcedure, publicProcedure, router } from '@/src/server/trpc';
import {
	getUserRequestListInputSchema,
	getUserRequestListQuery
} from './get-list';
import {
	createUserRequestInputSchema,
	createUserRequestMutation
} from './create';
import {
	updateUserRequestInputSchema,
	updateUserRequestMutation
} from './update';
import {
	deleteUserRequestInputSchema,
	deleteUserRequestMutation
} from './delete';

export { createUserRequest, updateUserRequest } from './utils';

export const userRequestRouter = router({
	getList: protectedProcedure
		.meta({ isAdmin: true })
		.input(getUserRequestListInputSchema)
		.query(getUserRequestListQuery),

	create: publicProcedure
		.input(createUserRequestInputSchema)
		.mutation(createUserRequestMutation),

	update: protectedProcedure
		.meta({ isAdmin: true })
		.input(updateUserRequestInputSchema)
		.mutation(updateUserRequestMutation),

	delete: protectedProcedure
		.meta({ isAdmin: true })
		.input(deleteUserRequestInputSchema)
		.mutation(deleteUserRequestMutation)
});
