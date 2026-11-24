import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { assertAdminOrOwn, omitPassword } from './utils';

export const getUserByIdInputSchema = z.object({ id: z.number() });

export const getUserByIdQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getUserByIdInputSchema>;
}) => {
	const { id } = input;

	assertAdminOrOwn(ctx.session, id);

	const user = await ctx.prisma.user.findUnique({
		where: { id }
	});

	return { data: user ? omitPassword(user) : null };
};
