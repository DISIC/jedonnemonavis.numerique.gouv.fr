import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { updateUser } from './utils';

export const validateUserInputSchema = z.object({ token: z.string() });

export const validateUserQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof validateUserInputSchema>;
}) => {
	const { token } = input;

	const userValidationToken = await ctx.prisma.userValidationToken.findUnique({
		where: { token },
		include: { user: true }
	});

	if (!userValidationToken) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Invalid token'
		});
	} else {
		const updatedUser = await updateUser(
			ctx.prisma,
			userValidationToken.user.id,
			{
				...userValidationToken.user,
				active: true
			}
		);

		await ctx.prisma.userValidationToken.delete({
			where: {
				id: userValidationToken.id
			}
		});

		return { data: updatedUser };
	}
};
