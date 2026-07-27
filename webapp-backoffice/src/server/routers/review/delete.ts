import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
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

	const form = await ctx.prisma.form.findUnique({
		where: { id: form_id },
		select: { isTop250: true }
	});

	if (form?.isTop250) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'Reviews of a démarche essentielle form cannot be deleted'
		});
	}

	const review = await ctx.prisma.review.findFirst({
		where: { id: review_id, product_id },
		include: { answers: true }
	});

	if (!review) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Review not found'
		});
	}

	const user = ctx.session?.user;

	const answersSnapshot = review.answers.map(a => ({
		id: a.id,
		field_code: a.field_code,
		field_label: a.field_label,
		answer_text: a.answer_text,
		answer_item_id: a.answer_item_id,
		intention: a.intention,
		kind: a.kind,
		parent_answer_id: a.parent_answer_id
	}));

	await ctx.prisma.$transaction(async tx => {
		await tx.archivedReview.create({
			data: {
				original_review_id: review.id,
				review_created_at: review.created_at,
				product_id: review.product_id,
				form_id: review.form_id,
				button_id: review.button_id,
				user_id: review.user_id,
				has_verbatim: review.has_verbatim,
				answers: answersSnapshot as Prisma.InputJsonValue,
				deleted_by: user ? parseInt(user.id) : null
			}
		});

		await tx.answer.deleteMany({
			where: {
				review_id: review.id,
				review_created_at: review.created_at,
				parent_answer_id: { not: null }
			}
		});

		await tx.answer.deleteMany({
			where: { review_id: review.id, review_created_at: review.created_at }
		});

		await tx.review.delete({
			where: {
				id_created_at: { id: review.id, created_at: review.created_at }
			}
		});
	});

	const deleteFromEs = (index: string) =>
		ctx.elkClient.deleteByQuery({
			index,
			refresh: true,
			conflicts: 'proceed',
			body: {
				query: { term: { review_id } }
			}
		});

	const esResults = await Promise.allSettled([
		deleteFromEs('jdma-answers'),
		deleteFromEs('jdma-answers-tokens')
	]);

	esResults.forEach(result => {
		if (result.status === 'rejected') {
			console.error(
				`[review.delete] Elasticsearch cleanup failed for review ${review_id}, stats may still count it:`,
				result.reason
			);
		}
	});

	if (user) {
		await ctx.prisma.userEvent.create({
			data: {
				user_id: parseInt(user.id),
				action: 'service_review_delete',
				product_id,
				form_id,
				metadata: { review_id }
			}
		});
	}

	return { success: true };
};
