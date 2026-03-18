import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createOTP } from './utils';

export const checkEmailInputSchema = z.object({ email: z.string() });

export const checkEmailMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof checkEmailInputSchema>;
}) => {
	const { email } = input;

	const user = await ctx.prisma.user.findUnique({
		where: {
			email: email.toLowerCase()
		}
	});

	if (!user) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'User not found'
		});
	} else if (user.xwiki_account && !user.active) {
		createOTP(ctx.prisma, user);

		return { data: undefined, metadata: { statusCode: 206 } };
	} else if (user.proconnect_account) {
		return { data: undefined, metadata: { statusCode: 203 } };
	} else if (!user.active) {
		// Code: 423
		throw new TRPCError({
			code: 'CONFLICT',
			message: "User isn't active"
		});
	} else {
		return { data: user, metadata: { statusCode: 200 } };
	}
};
