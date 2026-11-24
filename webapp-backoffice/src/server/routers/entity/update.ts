import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { normalizeString } from '@/src/utils/tools';
import { z } from 'zod';
import { checkEntityRight } from './utils';

export const updateEntityInputSchema = z.object({
	id: z.number(),
	entity: z.object({
		name: z.string().min(1),
		acronym: z.string()
	})
});

export const updateEntityMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateEntityInputSchema>;
}) => {
	const { id, entity } = input;

	await checkEntityRight({
		prisma: ctx.prisma,
		session: ctx.session!,
		entity_id: id
	});

	const existsEntity = await ctx.prisma.entity.findUnique({
		where: { name: entity.name }
	});

	if (existsEntity && existsEntity.id !== id)
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'Entity with this name already exists'
		});

	const updatedEntity = await ctx.prisma.entity.update({
		where: { id },
		data: {
			name: entity.name,
			acronym: entity.acronym,
			name_formatted: normalizeString(entity.name)
		}
	});

	return { data: updatedEntity };
};
