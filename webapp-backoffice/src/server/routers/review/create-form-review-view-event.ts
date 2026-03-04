import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const createFormReviewViewEventInputSchema = z.object({
	product_id: z.number(),
	form_id: z.number()
});

export const createFormReviewViewEventMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createFormReviewViewEventInputSchema>;
}) => {
	const user = ctx.session?.user;
	if (user) {
		await ctx.prisma.userEvent.create({
			data: {
				user_id: parseInt(user.id),
				action: 'form_reviews_view' as any, // Cast temporaire en attendant la génération Prisma
				product_id: input.product_id,
				metadata: {
					form_id: input.form_id
				}
			}
		});
	}
	return { success: true };
};
