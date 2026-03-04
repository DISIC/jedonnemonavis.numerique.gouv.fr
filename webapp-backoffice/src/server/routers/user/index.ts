import { protectedProcedure, publicProcedure, router } from '@/src/server/trpc';
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

	register: publicProcedure
		.input(registerUserInputSchema)
		.mutation(registerUserMutation),

	validate: publicProcedure
		.input(validateUserInputSchema)
		.query(validateUserQuery),

	checkEmail: publicProcedure
		.input(checkEmailInputSchema)
		.mutation(checkEmailMutation),

	me: publicProcedure.input(getMeInputSchema).query(getMeQuery),

	getOtp: publicProcedure.input(getOtpInputSchema).mutation(getOtpMutation),

	initResetPwd: publicProcedure
		.input(initResetPwdInputSchema)
		.mutation(initResetPwdMutation),

	checkToken: publicProcedure
		.input(checkTokenInputSchema)
		.query(checkTokenQuery),

	changePAssword: publicProcedure
		.input(changePasswordInputSchema)
		.mutation(changePasswordMutation),

	resendValidationEmail: publicProcedure
		.input(resendValidationEmailInputSchema)
		.mutation(resendValidationEmailMutation)
});
