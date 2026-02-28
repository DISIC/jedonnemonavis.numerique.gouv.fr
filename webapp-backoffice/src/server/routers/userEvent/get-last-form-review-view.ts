import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getLastFormReviewViewInputSchema = z.object({
	product_id: z.number(),
	form_id: z.number()
});

export const getLastFormReviewViewQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getLastFormReviewViewInputSchema>;
}) => {
	const { product_id, form_id } = input;

	const lastSeenFormReview = await ctx.prisma.userEvent.findMany({
		where: {
			user_id: parseInt(ctx.session?.user?.id),
			// NOTE: 'form_reviews_view' is not yet in the TypeAction Prisma enum; pending schema update
			action: 'form_reviews_view' as any,
			product_id: product_id,
			metadata: {
				path: ['form_id'],
				equals: form_id
			}
		},
		orderBy: { created_at: 'desc' },
		take: 1
	});

	let lastLog = lastSeenFormReview;

	if (lastSeenFormReview.length === 0) {
		const lastSeenProductReview = await ctx.prisma.userEvent.findMany({
			where: {
				user_id: parseInt(ctx.session?.user?.id),
				action: 'service_reviews_view',
				product_id: product_id
			},
			orderBy: { created_at: 'desc' },
			take: 1
		});
		lastLog = lastSeenProductReview;
	}

	const user = ctx.session?.user;
	if (user) {
		await ctx.prisma.userEvent.create({
			data: {
				user_id: parseInt(user.id),
				// NOTE: 'form_reviews_view' is not yet in the TypeAction Prisma enum; pending schema update
				action: 'form_reviews_view' as any,
				product_id: product_id,
				metadata: {
					form_id: form_id
				}
			}
		});
	}

	const logToReturn = lastLog.length > 1 ? [lastLog[1]] : lastLog;
	return { data: logToReturn };
};
