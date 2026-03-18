import { EntityUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { normalizeString } from '@/src/utils/tools';
import { z } from 'zod';

export const createEntityInputSchema = EntityUncheckedCreateInputSchema;

export const createEntityMutation = async ({
	ctx,
	input: entityPayload
}: {
	ctx: Context;
	input: z.infer<typeof createEntityInputSchema>;
}) => {
	const userEmail = ctx.session?.user?.email;

	const existsEntity = await ctx.prisma.entity.findUnique({
		where: { name: entityPayload.name }
	});

	if (existsEntity)
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'Entity with this name already exists'
		});

	entityPayload.name_formatted = normalizeString(entityPayload.name);

	const entity = await ctx.prisma.entity.create({
		data: {
			...entityPayload,
			adminEntityRights: !ctx.session?.user?.role.includes('admin')
				? { create: [{ user_email: userEmail }] }
				: {}
		}
	});

	return { data: entity };
};
