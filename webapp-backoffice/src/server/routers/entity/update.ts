import { EntityUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { normalizeString } from '@/src/utils/tools';
import { z } from 'zod';

export const updateEntityInputSchema = z.object({
	id: z.number(),
	entity: EntityUncheckedUpdateInputSchema
});

export const updateEntityMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateEntityInputSchema>;
}) => {
	const { id, entity } = input;

	const existsEntity = await ctx.prisma.entity.findUnique({
		where: { name: typeof entity.name === 'string' ? entity.name : undefined }
	});

	if (existsEntity && existsEntity.id !== entity.id)
		throw new TRPCError({
			code: 'CONFLICT',
			message: 'Entity with this name already exists'
		});

	entity.name_formatted = normalizeString(entity.name as string);

	const updatedEntity = await ctx.prisma.entity.update({
		where: { id },
		data: { ...entity }
	});

	return { data: updatedEntity };
};
