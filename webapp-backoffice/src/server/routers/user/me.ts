import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const getMeInputSchema = z.object({ otp: z.string().optional() });

export const getMeQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getMeInputSchema>;
}) => {
	const { otp } = input;

	if (otp) {
		const userOTP = await ctx.prisma.userOTP.findUnique({
			where: {
				code: otp
			},
			include: {
				user: {
					select: {
						firstName: true,
						lastName: true,
						email: true
					}
				}
			}
		});

		if (!userOTP?.user)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'User not found from OTP'
			});

		return { data: userOTP.user };
	} else {
		const session = ctx.session;

		if (!session) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Unauthorized'
			});
		}

		if (!session.user) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'User not found from session'
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

		return { data: user };
	}
};
