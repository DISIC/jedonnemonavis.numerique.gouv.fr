import { UserDetailsUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const createUserDetailsInputSchema =
	UserDetailsUncheckedCreateInputSchema;

export const createUserDetailsMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createUserDetailsInputSchema>;
}) => {
	if (input.jobTitle && input.jobTitle.length > 64) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Job title must be 64 characters or less'
		});
	}
	const createdUserDetails = await ctx.prisma.userDetails.create({
		data: input
	});
	return { data: createdUserDetails };
};
