import { UserRequestUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { updateUserRequest } from './utils';

export const updateUserRequestInputSchema = z.object({
	id: z.number(),
	userRequest: UserRequestUpdateInputSchema,
	createDomain: z.boolean().default(false),
	message: z.string().optional()
});

export const updateUserRequestMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateUserRequestInputSchema>;
}) => {
	const { id, userRequest, createDomain, message } = input;

	const updatedUserRequest = await updateUserRequest(
		ctx.prisma,
		id,
		userRequest,
		createDomain,
		message
	);

	return { data: updatedUserRequest };
};
