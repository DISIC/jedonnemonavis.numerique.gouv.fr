import { UserRoleSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateUnusablePassword } from './utils';

export const createUserInputSchema = z.object({
	email: z.string().email(),
	firstName: z.string(),
	lastName: z.string(),
	role: UserRoleSchema.optional()
});

export const createUserMutation = async ({
	ctx,
	input: newUser
}: {
	ctx: Context;
	input: z.infer<typeof createUserInputSchema>;
}) => {
	const userExists = await ctx.prisma.user.findUnique({
		where: {
			email: newUser.email.toLowerCase()
		}
	});

	if (userExists)
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'User with email already exists'
		});

	const createdUser = await ctx.prisma.user.create({
		data: {
			...newUser,
			email: newUser.email.toLowerCase(),
			password: generateUnusablePassword(),
			active: true,
			notifications: true,
			notifications_frequency: 'weekly'
		}
	});

	return { data: createdUser };
};
