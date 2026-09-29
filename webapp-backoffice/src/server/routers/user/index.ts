import { protectedProcedure, router } from '@/src/server/trpc';
import { getUserListInputSchema, getUserListQuery } from './get-list';
import { getUserByIdInputSchema, getUserByIdQuery } from './get-by-id';
import {
	getUserByIdWithRightsInputSchema,
	getUserByIdWithRightsQuery
} from './get-by-id-with-rights';
import { createUserInputSchema, createUserMutation } from './create';
import { updateUserInputSchema, updateUserMutation } from './update';
import { deleteUserInputSchema, deleteUserMutation } from './delete';
import {
	deleteManyUsersInputSchema,
	deleteManyUsersMutation
} from './delete-many';
import { getMeQuery } from './me';
import {
	getNotificationsEmailPreviewInputSchema,
	getNotificationsEmailPreviewQuery
} from './get-notifications-email-preview';

export { makeRelationFromUserInvite } from './utils';

export const userRouter = router({
	getList: protectedProcedure
		.meta({ isAdmin: true })
		.input(getUserListInputSchema)
		.query(getUserListQuery),

	getById: protectedProcedure
		.meta({ isAdminOrOwn: true })
		.input(getUserByIdInputSchema)
		.query(getUserByIdQuery),

	getByIdWithRights: protectedProcedure
		.meta({ isAdminOrOwn: true })
		.input(getUserByIdWithRightsInputSchema)
		.query(getUserByIdWithRightsQuery),

	getNotificationsEmailPreview: protectedProcedure
		.input(getNotificationsEmailPreviewInputSchema)
		.query(getNotificationsEmailPreviewQuery),

	create: protectedProcedure
		.meta({ isAdmin: true })
		.input(createUserInputSchema)
		.mutation(createUserMutation),

	update: protectedProcedure
		.meta({ isAdminOrOwn: true })
		.input(updateUserInputSchema)
		.mutation(updateUserMutation),

	delete: protectedProcedure
		.meta({ isAdminOrOwn: true })
		.input(deleteUserInputSchema)
		.mutation(deleteUserMutation),

	deleteMany: protectedProcedure
		.meta({ isAdmin: true })
		.input(deleteManyUsersInputSchema)
		.mutation(deleteManyUsersMutation),

	me: protectedProcedure.query(getMeQuery)
});
