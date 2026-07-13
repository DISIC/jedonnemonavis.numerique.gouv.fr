import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getCountsByFormInputSchema = z.object({
	product_id: z.number()
});

export const getCountsByFormOutputSchema = z.object({
	countsByForm: z.record(z.string(), z.number()),
	newCountsByForm: z.record(z.string(), z.number()),
	totalCount: z.number(),
	newCount: z.number()
});

export const getCountsByFormQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getCountsByFormInputSchema>;
}) => {
	const { product_id } = input;

	const countsByFormRaw = await ctx.prisma.review.groupBy({
		by: ['form_id'],
		where: { product_id },
		_count: { id: true }
	});

	const countsByForm = countsByFormRaw.reduce(
		(acc, curr) => {
			acc[curr.form_id.toString()] = curr._count.id;
			return acc;
		},
		{} as Record<string, number>
	);

	const totalCount = await ctx.prisma.review.count({
		where: { product_id }
	});

	const lastSeenReview = await ctx.prisma.userEvent.findMany({
		where: {
			user_id: parseInt(ctx.session!.user.id),
			action: 'service_reviews_view',
			product_id: product_id
		},
		orderBy: { created_at: 'desc' },
		take: 1
	});

	const newCount = lastSeenReview[0]
		? await ctx.prisma.review.count({
				where: {
					product_id: product_id,
					created_at: { gte: lastSeenReview[0].created_at }
				}
		  })
		: 0;

	const newCountsByForm: Record<string, number> = {};

	for (const formData of countsByFormRaw) {
		const formId = formData.form_id;

		const lastSeenFormReview = await ctx.prisma.userEvent.findMany({
			where: {
				user_id: parseInt(ctx.session!.user.id),
				action: 'form_reviews_view',
				product_id: product_id,
				metadata: {
					path: ['form_id'],
					equals: formId
				}
			},
			orderBy: { created_at: 'desc' },
			take: 1
		});

		const lastSeenDate = lastSeenFormReview[0]
			? lastSeenFormReview[0].created_at
			: lastSeenReview[0]
			? lastSeenReview[0].created_at
			: null;

		if (lastSeenDate) {
			const newCountForForm = await ctx.prisma.review.count({
				where: {
					form_id: formId,
					created_at: { gte: lastSeenDate }
				}
			});
			newCountsByForm[formId.toString()] = newCountForForm;
		} else {
			newCountsByForm[formId.toString()] = formData._count.id;
		}
	}

	return {
		countsByForm,
		newCountsByForm,
		totalCount,
		newCount
	};
};
