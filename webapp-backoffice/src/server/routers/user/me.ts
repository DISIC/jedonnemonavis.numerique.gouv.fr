import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { omitPassword } from './utils';

export const getMeQuery = async ({ ctx }: { ctx: Context }) => {
	const session = ctx.session;

	if (!session?.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Unauthorized'
		});
	}

	const user = await ctx.prisma.user.findUnique({
		where: {
			email: session.user.email as string
		}
	});

	if (!user)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'User not found'
		});

	return { data: omitPassword(user) };
};
