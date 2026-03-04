import { protectedProcedure, router } from '@/src/server/trpc';
import {
	getAccessRightListInputSchema,
	getAccessRightListQuery
} from './get-list';
import {
	getAccessRightUserListInputSchema,
	getAccessRightUserListQuery
} from './get-user-list';
import {
	createAccessRightInputSchema,
	createAccessRightMutation
} from './create';
import {
	resendAccessRightEmailInputSchema,
	resendAccessRightEmailMutation
} from './resend-email';
import {
	updateAccessRightInputSchema,
	updateAccessRightMutation
} from './update';
import {
	deleteAccessRightInputSchema,
	deleteAccessRightMutation
} from './delete';

export const accessRightRouter = router({
	getList: protectedProcedure
		.input(getAccessRightListInputSchema)
		.query(getAccessRightListQuery),

	getUserList: protectedProcedure
		.input(getAccessRightUserListInputSchema)
		.query(getAccessRightUserListQuery),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(createAccessRightInputSchema)
		.mutation(createAccessRightMutation),

	resendEmail: protectedProcedure
		.input(resendAccessRightEmailInputSchema)
		.mutation(resendAccessRightEmailMutation),

	update: protectedProcedure
		.meta({ logEvent: true })
		.input(updateAccessRightInputSchema)
		.mutation(updateAccessRightMutation),

	delete: protectedProcedure
		.meta({ logEvent: true })
		.input(deleteAccessRightInputSchema)
		.mutation(deleteAccessRightMutation)
});
