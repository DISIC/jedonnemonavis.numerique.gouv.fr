import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

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
	const { admin_entity_right_id } = input;

	const adminEntityRightDelete = await ctx.prisma.adminEntityRight.delete({
		where: { id: admin_entity_right_id }
	});

	return adminEntityRightDelete;
};
