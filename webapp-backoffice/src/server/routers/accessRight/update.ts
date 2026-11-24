import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product/utils';

export const updateAccessRightInputSchema = z
	.object({
		id: z.number(),
		status: z.enum(['carrier_admin', 'carrier_user', 'removed']),
		product_id: z.number().optional()
	})
	.strict();

export const updateAccessRightMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateAccessRightInputSchema>;
}) => {
	const { id, status, product_id } = input;

	const existingAccessRight = await ctx.prisma.accessRight.findUnique({
		where: { id }
	});

	if (!existingAccessRight)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Access right not found'
		});

	if (product_id !== undefined && product_id !== existingAccessRight.product_id)
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'product_id does not match the access right'
		});

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id: existingAccessRight.product_id
	});

	const accessRight = await ctx.prisma.accessRight.update({
		where: { id },
		data: { status }
	});

	return accessRight;
};
