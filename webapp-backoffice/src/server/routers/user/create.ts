import { UserCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';

export const createUserInputSchema = UserCreateInputSchema;

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

	const salt = bcrypt.genSaltSync(10);
	const hashedPassword = bcrypt.hashSync(newUser.password, salt);

	newUser.password = hashedPassword;

	const createdUser = await ctx.prisma.user.create({
		data: {
			...newUser,
			email: newUser.email.toLowerCase(),
			active: true,
			notifications: true,
			notifications_frequency: 'weekly'
		}
	});

	return { data: createdUser };
};
