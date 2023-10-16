import { z } from 'zod';
import { router, publicProcedure } from '@/src/server/trpc';
import { Prisma, PrismaClient, RequestMode } from '@prisma/client';
import {
	RequestModeSchema,
	UserCreateInputSchema
} from '@/prisma/generated/zod';
import crypto from 'crypto';

export async function createUserRequest(
	prisma: PrismaClient,
	user: Prisma.UserCreateInput,
	userRequest: { reason: string; mode: RequestMode }
) {
	const hashedPassword = crypto
		.createHash('sha256')
		.update(user.password)
		.digest('hex');

	user.password = hashedPassword;

	const createdUser = await prisma.user.create({
		data: {
			...user,
			active: false
		}
	});

	const createdUserRequest = prisma.userRequest.create({
		data: {
			reason: userRequest.reason,
			mode: userRequest.mode,
			user_id: createdUser.id
		}
	});

	return createdUserRequest;
}

export const userRequestRouter = router({
	create: publicProcedure
		.input(
			z.object({
				userRequest: z.object({ reason: z.string(), mode: RequestModeSchema }),
				user: UserCreateInputSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userRequest, user } = input;

			const createdUserRequest = await createUserRequest(
				ctx.prisma,
				user,
				userRequest
			);

			return createdUserRequest;
		})
});
