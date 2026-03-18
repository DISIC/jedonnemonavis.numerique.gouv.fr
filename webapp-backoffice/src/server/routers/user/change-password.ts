import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';

export const changePasswordInputSchema = z.object({
	token: z.string(),
	password: z.string()
});

export const changePasswordMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof changePasswordInputSchema>;
}) => {
	const { token, password } = input;

	const userResetToken = await ctx.prisma.userResetToken.findUnique({
		where: {
			token
		}
	});

	if (!userResetToken) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Invalid token'
		});
	}

	const now = new Date();
	if (now.getTime() > userResetToken.expiration_date.getTime()) {
		await ctx.prisma.userResetToken.delete({
			where: {
				token
			}
		});
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Expired token'
		});
	}

	const salt = bcrypt.genSaltSync(10);
	const hashedPassword = bcrypt.hashSync(password, salt);

	const updatedUser = await ctx.prisma.user.update({
		where: {
			id: userResetToken.user_id
		},
		data: {
			password: hashedPassword
		}
	});

	await ctx.prisma.userResetToken.delete({
		where: {
			token
		}
	});

	return { data: updatedUser };
};
