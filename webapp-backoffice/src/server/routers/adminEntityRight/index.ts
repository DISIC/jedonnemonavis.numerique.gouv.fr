import { protectedProcedure, router } from '@/src/server/trpc';
import {
	getAdminEntityRightListInputSchema,
	getAdminEntityRightListQuery
} from './get-list';
import {
	getAdminEntityRightUserListInputSchema,
	getAdminEntityRightUserListQuery
} from './get-user-list';
import {
	createAdminEntityRightInputSchema,
	createAdminEntityRightMutation
} from './create';
import {
	resendAdminEntityRightEmailInputSchema,
	resendAdminEntityRightEmailMutation
} from './resend-email';
import {
	updateAdminEntityRightInputSchema,
	updateAdminEntityRightMutation
} from './update';
import {
	deleteAdminEntityRightInputSchema,
	deleteAdminEntityRightMutation
} from './delete';

export const adminEntityRightRouter = router({
	getList: protectedProcedure
		.input(getAdminEntityRightListInputSchema)
		.query(getAdminEntityRightListQuery),

	getUserList: protectedProcedure
		.input(getAdminEntityRightUserListInputSchema)
		.query(getAdminEntityRightUserListQuery),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(createAdminEntityRightInputSchema)
		.mutation(createAdminEntityRightMutation),

	resendEmail: protectedProcedure
		.input(resendAdminEntityRightEmailInputSchema)
		.mutation(resendAdminEntityRightEmailMutation),

	update: protectedProcedure
		.input(updateAdminEntityRightInputSchema)
		.meta({ logEvent: true })
		.mutation(updateAdminEntityRightMutation),

	delete: protectedProcedure
		.meta({ logEvent: true })
		.input(deleteAdminEntityRightInputSchema)
		.mutation(deleteAdminEntityRightMutation)
});
