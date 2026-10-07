import type { Context } from '@/src/server/trpc';
import { renderRegisterEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { NotificationFrequency, UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	assertAdminOrOwn,
	checkUserDomain,
	generateValidationToken,
	omitPassword
} from './utils';

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

	// Hors administrateur, une nouvelle adresse doit être confirmée par e-mail.
	const requiresEmailValidation = !isAdmin && !!dataToUpdate.email;

	if (!requiresEmailValidation) {
		const updatedUser = await ctx.prisma.user.update({
			where: { id },
			data: dataToUpdate
		});

		return { data: omitPassword(updatedUser) };
	}

	const newEmail = dataToUpdate.email as string;
	const token = await generateValidationToken(ctx.prisma, id);
	const discardToken = () =>
		ctx.prisma.userValidationToken.deleteMany({
			where: { user_id: id, token }
		});

	const emailHtml = await renderRegisterEmail({
		token,
		baseUrl: process.env.NODEMAILER_BASEURL
	});

	const sent = await sendMail(
		'Confirmez votre email',
		newEmail,
		emailHtml,
		`Cliquez sur ce lien pour valider votre compte : ${
			process.env.NODEMAILER_BASEURL
		}/register/validate?${new URLSearchParams({ token })}`
	);

	if (!sent) {
		await discardToken();

		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Unable to send validation email'
		});
	}

	let updatedUser;
	try {
		updatedUser = await ctx.prisma.user.update({
			where: { id },
			data: { ...dataToUpdate, active: false }
		});
	} catch (error) {
		await discardToken();
		throw error;
	}

	return { data: omitPassword(updatedUser) };
};
