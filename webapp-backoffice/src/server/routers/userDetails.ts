import { UserDetailsUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import { protectedProcedure, router } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';

export const userDetailsRouter = router({
	getByUser: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const userDetails = await ctx.prisma.userDetails.findFirst({
			where: {
				userId: parseInt(userId)
			}
		});
		return { data: userDetails };
	}),
	create: protectedProcedure
		.input(UserDetailsUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
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
		})
});
