import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const getOtpInputSchema = z.object({
	email: z.string(),
	otp: z.string()
});

export const getOtpMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getOtpInputSchema>;
}) => {
	const { email, otp } = input;

	const userOTP = await ctx.prisma.userOTP.findUnique({
		where: {
			code: otp,
			user: {
				email: email.toLowerCase()
			}
		}
	});

	if (!userOTP) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Invalid OTP'
		});
	} else {
		const now = new Date();
		if (now.getTime() > userOTP.expiration_date.getTime()) {
			await ctx.prisma.userOTP.delete({
				where: {
					code: otp
				}
			});
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Expired OTP'
			});
		} else {
			return { data: { id: userOTP.id } };
		}
	}
};
