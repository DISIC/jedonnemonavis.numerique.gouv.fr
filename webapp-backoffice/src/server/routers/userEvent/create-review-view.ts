import { UserEventUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const createReviewViewInputSchema = UserEventUncheckedCreateInputSchema;

export const createReviewViewMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createReviewViewInputSchema>;
}) => {
	const newButton = await ctx.prisma.userEvent.create({
		data: input
	});

	return { data: newButton };
};
