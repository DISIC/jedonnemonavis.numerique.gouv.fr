import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { normalizeString } from '@/src/utils/tools';
import { z } from 'zod';

export const createEntityInputSchema = z.object({
	name: z.string().min(1),
	acronym: z.string()
});

export const createEntityMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createEntityInputSchema>;
}) => {
	const userEmail = ctx.session?.user?.email;
	const { name, acronym } = input;

	const existsEntity = await ctx.prisma.entity.findUnique({
		where: { name }
	});

	if (existsEntity)
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'Entity with this name already exists'
		});

	const entity = await ctx.prisma.entity.create({
		data: {
			name,
			acronym,
			name_formatted: normalizeString(name),
			adminEntityRights: !ctx.session?.user?.role.includes('admin')
				? { create: [{ user_email: userEmail }] }
				: {}
		}
	});

	return { data: entity };
};
