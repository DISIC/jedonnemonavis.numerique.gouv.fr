import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const deleteDomainInputSchema = z.object({ id: z.number() });

export const deleteDomainMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteDomainInputSchema>;
}) => {
	const { id } = input;
	const deletedDomain = await ctx.prisma.whiteListedDomain.delete({
		where: { id }
	});
	return { data: deletedDomain };
};
