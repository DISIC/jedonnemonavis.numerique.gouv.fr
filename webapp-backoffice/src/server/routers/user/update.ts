import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { NotificationFrequency, UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { assertAdminOrOwn, checkUserDomain, omitPassword } from './utils';

export const updateUserInputSchema = z.object({
	id: z.number(),
	user: z.object({
		firstName: z.string().nullable().optional(),
		lastName: z.string().nullable().optional(),
		email: z.string().email().optional(),
		notifications: z.boolean().optional(),
		notifications_frequency: z.nativeEnum(NotificationFrequency).optional(),
		alerts_enabled: z.boolean().optional(),
		// Réservés aux administrateurs (ignorés sinon).
		role: z.nativeEnum(UserRole).optional(),
		active: z.boolean().optional()
	})
});

export const updateUserMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateUserInputSchema>;
}) => {
	const { id, user } = input;
	const isAdmin = ctx.session?.user?.role.includes('admin');

	assertAdminOrOwn(ctx.session, id);

	const { role, active, ...userWithoutSensitive } = user;

	const dataToUpdate = isAdmin
		? { ...userWithoutSensitive, role, active }
		: { ...userWithoutSensitive };

	if (dataToUpdate.email) {
		dataToUpdate.email = dataToUpdate.email.toLowerCase();

		const currentUser = await ctx.prisma.user.findUnique({ where: { id } });
		if (currentUser?.email === dataToUpdate.email) delete dataToUpdate.email;
		else if (currentUser?.proconnect_account)
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'ProConnect account email cannot be changed'
			});
	}

	if (dataToUpdate.email) {
		const userHasConflict = await ctx.prisma.user.findUnique({
			where: {
				email: dataToUpdate.email
			}
		});

		if (userHasConflict && userHasConflict.id !== id)
			throw new TRPCError({
				code: 'CONFLICT',
				message: 'User already exists'
			});

		const isWhiteListed = await checkUserDomain(ctx.prisma, dataToUpdate.email);

		if (!isWhiteListed)
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'User email domain not whitelisted'
			});
	}

	const updatedUser = await ctx.prisma.user.update({
		where: { id },
		data: dataToUpdate
	});

	return { data: omitPassword(updatedUser) };
};
