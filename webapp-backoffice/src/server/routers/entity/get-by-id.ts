import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getEntityByIdInputSchema = z.object({ id: z.number() });

export const getEntityByIdQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getEntityByIdInputSchema>;
}) => {
	const { id } = input;
	const entity = await ctx.prisma.entity.findUnique({ where: { id } });
	return { data: entity };
};
