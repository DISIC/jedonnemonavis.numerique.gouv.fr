import { UserCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { RequestModeSchema } from '@/prisma/generated/zod';
import { z } from 'zod';
import { createUserRequest } from './utils';

export const createUserRequestInputSchema = z.object({
	userRequest: z.object({
		reason: z.string(),
		mode: RequestModeSchema,
		inviteToken: z.string().optional()
	}),
	user: UserCreateInputSchema
});

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
