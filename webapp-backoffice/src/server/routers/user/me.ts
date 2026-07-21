import type { Context } from '@/src/server/trpc';
import { getClientIp } from '@/src/server/utils/client-ip';
import { consumeRateLimit } from '@/src/server/utils/rate-limit';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { omitPassword } from './utils';

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
		// Seule la branche OTP est limitée : la branche session est appelée à
		// chaque navigation et n'expose rien de plus que la session en cours.
		consumeRateLimit({
			key: `user.me:otp:${getClientIp(ctx.req)}`,
			max: 20,
			windowMs: 60 * 1000
		});

		const userOTP = await ctx.prisma.userOTP.findUnique({
			where: {
				code: otp
			},
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						alerts_enabled: true
					}
				}
			}
		});

		if (!userOTP?.user)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'User not found from OTP'
			});

		if (userOTP.expiration_date.getTime() < Date.now()) {
			await ctx.prisma.userOTP.delete({ where: { code: otp } });
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Expired OTP'
			});
		}

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

		return { data: omitPassword(user) };
	}
};
