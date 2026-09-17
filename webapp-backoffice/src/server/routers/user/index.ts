import {
	protectedProcedure,
	publicProcedure,
	rateLimitedProcedure,
	router
} from '@/src/server/trpc';
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
import { registerUserInputSchema, registerUserMutation } from './register';
import { validateUserInputSchema, validateUserQuery } from './validate';
import { checkEmailInputSchema, checkEmailMutation } from './check-email';
import { getMeInputSchema, getMeQuery } from './me';
import { getOtpInputSchema, getOtpMutation } from './get-otp';
import {
	initResetPwdInputSchema,
	initResetPwdMutation
} from './init-reset-pwd';
import { checkTokenInputSchema, checkTokenQuery } from './check-token';
import {
	changePasswordInputSchema,
	changePasswordMutation
} from './change-password';
import {
	resendValidationEmailInputSchema,
	resendValidationEmailMutation
} from './resend-validation-email';
import {
	getNotificationsEmailPreviewInputSchema,
	getNotificationsEmailPreviewQuery
} from './get-notifications-email-preview';

export { generateValidationToken, makeRelationFromUserInvite } from './utils';

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

	register: rateLimitedProcedure
		.input(registerUserInputSchema)
		.mutation(registerUserMutation),

	validate: rateLimitedProcedure
		.input(validateUserInputSchema)
		.query(validateUserQuery),

	checkEmail: rateLimitedProcedure
		.input(checkEmailInputSchema)
		.mutation(checkEmailMutation),

	me: publicProcedure.input(getMeInputSchema).query(getMeQuery),

	getOtp: rateLimitedProcedure.input(getOtpInputSchema).mutation(getOtpMutation),

	initResetPwd: rateLimitedProcedure
		.input(initResetPwdInputSchema)
		.mutation(initResetPwdMutation),

	checkToken: rateLimitedProcedure
		.input(checkTokenInputSchema)
		.query(checkTokenQuery),

	changePAssword: rateLimitedProcedure
		.input(changePasswordInputSchema)
		.mutation(changePasswordMutation),

	resendValidationEmail: rateLimitedProcedure
		.input(resendValidationEmailInputSchema)
		.mutation(resendValidationEmailMutation)
});
