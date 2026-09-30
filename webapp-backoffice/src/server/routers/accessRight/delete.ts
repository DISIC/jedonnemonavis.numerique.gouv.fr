import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product/utils';

export const deleteAccessRightInputSchema = z.object({
	access_right_id: z.number()
});

export const deleteAccessRightMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteAccessRightInputSchema>;
}) => {
	const { access_right_id } = input;

	const existingAccessRight = await ctx.prisma.accessRight.findUnique({
		where: { id: access_right_id }
	});

	if (!existingAccessRight)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Access right not found'
		});

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id: existingAccessRight.product_id
	});

	const accessRightDelete = await ctx.prisma.accessRight.delete({
		where: { id: access_right_id }
	});

	return accessRightDelete;
};
