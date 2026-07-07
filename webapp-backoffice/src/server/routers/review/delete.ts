import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const deleteReviewInputSchema = z.object({
	review_id: z.number(),
	product_id: z.number(),
	form_id: z.number()
});

export const deleteReviewMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteReviewInputSchema>;
}) => {
	const { review_id, product_id, form_id } = input;

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id
	});

	const deletedAt = new Date();

	const { count } = await ctx.prisma.review.updateMany({
		where: { id: review_id, product_id, isDeleted: { not: true } },
		data: { isDeleted: true, deleted_at: deletedAt }
	});

	if (count === 0) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Review not found or already deleted'
		});
	}

	const deleteFromEs = (index: string) =>
		ctx.elkClient.deleteByQuery({
			index,
			refresh: true,
			conflicts: 'proceed',
			body: {
				query: { term: { review_id } }
			}
		});

	await Promise.allSettled([
		deleteFromEs('jdma-answers'),
		deleteFromEs('jdma-answers-tokens')
	]);

	const user = ctx.session?.user;
	if (user) {
		await ctx.prisma.userEvent.create({
			data: {
				user_id: parseInt(user.id),
				action: 'service_review_delete' as any,
				product_id,
				form_id,
				metadata: { review_id }
			}
		});
	}

	return { success: true };
};
