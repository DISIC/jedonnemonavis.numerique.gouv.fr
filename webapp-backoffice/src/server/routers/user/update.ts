import { UserUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkUserDomain } from './utils';

export const updateUserInputSchema = z.object({
	id: z.number(),
	user: UserUncheckedUpdateInputSchema
});

export const updateUserMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateUserInputSchema>;
}) => {
	const { id, user } = input;
	const { role, ...userWithoutRole } = user;

	const dataToUpdate = ctx.session?.user?.role.includes('admin')
		? { ...userWithoutRole, role }
		: { ...userWithoutRole };

	if (dataToUpdate.email) {
		const userHasConflict = await ctx.prisma.user.findUnique({
			where: {
				email: ((dataToUpdate.email as string) || '').toLowerCase()
			}
		});

		if (userHasConflict)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'User already exists'
			});

		const isWhiteListed = await checkUserDomain(
			ctx.prisma,
			((dataToUpdate.email as string) || '').toLowerCase()
		);

		if (!isWhiteListed)
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'User email domain not whitelisted'
			});
	}

	const updatedUser = await ctx.prisma.user.update({
		where: { id },
		data: dataToUpdate
	});

	return { data: updatedUser };
};
