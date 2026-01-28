import { UserDetailsUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import { protectedProcedure, router } from '@/src/server/trpc';
import { z } from 'zod';

export const userDetailsRouter = router({
	getByUserId: protectedProcedure
		.input(z.object({ user_id: z.number() }))
		.query(async ({ ctx, input }) => {
			const userDetails = await ctx.prisma.userDetails.findFirst({
				where: {
					userId: input.user_id
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
