import type { Context } from '@/src/server/trpc';

export const getUserDetailsByUserQuery = async ({
	ctx
}: {
	ctx: Context;
	input: {};
}) => {
	const userId = ctx.session.user.id;
	const userDetails = await ctx.prisma.userDetails.findFirst({
		where: { userId: parseInt(userId) }
	});
	return { data: userDetails };
};
