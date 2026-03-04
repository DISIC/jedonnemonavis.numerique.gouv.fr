import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const checkTokenInputSchema = z.object({ token: z.string() });

export const checkTokenQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof checkTokenInputSchema>;
}) => {
	const { token } = input;

	const userResetToken = await ctx.prisma.userResetToken.findUnique({
		where: {
			token
		}
	});

	if (!userResetToken) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Invalid token'
		});
	}

	const now = new Date();
	if (now.getTime() > userResetToken.expiration_date.getTime()) {
		await ctx.prisma.userResetToken.delete({
			where: {
				token
			}
		});
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Expired token'
		});
	}

	return { data: userResetToken };
};
