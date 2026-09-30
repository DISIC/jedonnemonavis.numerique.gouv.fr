import type { Context } from '@/src/server/trpc';
import { RequestModeSchema } from '@/prisma/generated/zod';
import { z } from 'zod';
import { createUserRequest } from './utils';

export const createUserRequestInputSchema = z.object({
	userRequest: z.object({
		reason: z.string().max(5000),
		mode: RequestModeSchema,
		inviteToken: z.string().max(255).optional()
	}),
	user: z.object({
		firstName: z.string().trim().max(255).optional(),
		lastName: z.string().trim().max(255).optional(),
		email: z.string().trim().toLowerCase().email().max(254),
		password: z
			.string()
			.min(12, 'Password must be at least 12 characters')
			.max(256)
	})
});

export type CreateUserRequestUserInput = z.infer<
	typeof createUserRequestInputSchema
>['user'];

export const createUserRequestMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createUserRequestInputSchema>;
}) => {
	const { userRequest, user } = input;

	const createdUserRequest = await createUserRequest(
		ctx.prisma,
		user,
		userRequest
	);

	return { data: createdUserRequest };
};
