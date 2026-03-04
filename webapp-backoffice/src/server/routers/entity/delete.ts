import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const deleteEntityInputSchema = z.object({ id: z.number() });

export const deleteEntityMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteEntityInputSchema>;
}) => {
	const { id } = input;
	const deletedEntity = await ctx.prisma.entity.delete({ where: { id } });
	return { data: deletedEntity };
};
