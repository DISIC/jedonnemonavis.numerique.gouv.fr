import { UserDetailsUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import { protectedProcedure, router } from '@/src/server/trpc';

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
			const createdUserDetails = await ctx.prisma.userDetails.create({
				data: input
			});
			return { data: createdUserDetails };
		})
});
