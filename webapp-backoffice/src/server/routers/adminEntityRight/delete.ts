import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkEntityRight } from '../entity/utils';

export const deleteAdminEntityRightInputSchema = z.object({
	admin_entity_right_id: z.number(),
	entity_name: z.string().optional(),
	entity_id: z.number().optional(),
	user_email: z.string().optional()
});

export const deleteAdminEntityRightMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteAdminEntityRightInputSchema>;
}) => {
	const { admin_entity_right_id, entity_id } = input;

	const existingAdminEntityRight = await ctx.prisma.adminEntityRight.findUnique(
		{ where: { id: admin_entity_right_id } }
	);

	if (!existingAdminEntityRight)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Admin entity right not found'
		});

	if (
		entity_id !== undefined &&
		entity_id !== existingAdminEntityRight.entity_id
	)
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'entity_id does not match the admin entity right'
		});

	await checkEntityRight({
		prisma: ctx.prisma,
		session: ctx.session!,
		entity_id: existingAdminEntityRight.entity_id
	});

	const adminEntityRightDelete = await ctx.prisma.adminEntityRight.delete({
		where: { id: admin_entity_right_id }
	});

	return adminEntityRightDelete;
};
