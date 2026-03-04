import { ReviewPartialWithRelationsSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { formatWhereAndOrder } from '@/src/utils/reviews';
import { getDateWhereFromUTCRange } from '@/src/utils/tools';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const getReviewListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	product_id: z.number().optional(),
	form_id: z.number().optional(),
	shouldIncludeAnswers: z.boolean().optional().default(false),
	mustHaveVerbatims: z.boolean().optional().default(false),
	mustHaveVerbatimsOptimzed: z.boolean().optional().default(false),
	sort: z.string().optional(),
	search: z.string().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	newReviews: z.boolean().optional(),
	needLogging: z.boolean().optional().default(false),
	loggingFromMail: z.boolean().optional(),
	filters: z
		.object({
			needVerbatim: z.boolean().optional(),
			needOtherDifficulties: z.boolean().optional(),
			needOtherHelp: z.boolean().optional(),
			buttonId: z.array(z.string()).optional(),
			fields: z
				.array(
					z.object({
						field_code: z.string(),
						values: z.array(z.string())
					})
				)
				.optional()
		})
		.optional()
});

export const getReviewListOutputSchema = z.object({
	data: z.array(ReviewPartialWithRelationsSchema),
	metadata: z.object({
		countFiltered: z.number(),
		countAll: z.number(),
		countNew: z.number(),
		countForm1: z.number(),
		countForm2: z.number()
	})
});

export const getReviewListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getReviewListInputSchema>;
}) => {
	const {
		numberPerPage,
		page,
		shouldIncludeAnswers,
		product_id,
		form_id,
		newReviews
	} = input;

	const product = await ctx.prisma.product.findUnique({
		where: {
			id: product_id
		}
	});

	const form = await ctx.prisma.form.findUnique({
		where: {
			id: form_id
		}
	});

	let lastSeenDate = null;
	if (newReviews && form_id) {
		const lastSeenFormReview = await ctx.prisma.userEvent.findMany({
			where: {
				user_id: parseInt(ctx.session!.user.id),
				action: 'form_reviews_view',
				product_id: product_id,
				metadata: {
					path: ['form_id'],
					equals: form_id
				}
			},
			orderBy: { created_at: 'desc' },
			take: 2
		});

		if (lastSeenFormReview.length === 0) {
			const lastSeenProductReview = await ctx.prisma.userEvent.findMany({
				where: {
					user_id: parseInt(ctx.session!.user.id),
					action: 'service_reviews_view',
					product_id: product_id
				},
				orderBy: { created_at: 'desc' },
				take: 2
			});
			const relevantLog =
				lastSeenProductReview.length > 1
					? lastSeenProductReview[1]
					: lastSeenProductReview[0];
			lastSeenDate = relevantLog?.created_at;
		} else {
			const relevantLog =
				lastSeenFormReview.length > 1
					? lastSeenFormReview[1]
					: lastSeenFormReview[0];
			lastSeenDate = relevantLog?.created_at;
		}
	}

	const { where, orderBy } = formatWhereAndOrder(
		{
			...input,
			lastSeenDate
		},
		!!form?.legacy
	);

	const lastSeenReview = await ctx.prisma.userEvent.findMany({
		where: {
			user_id: parseInt(ctx.session!.user.id),
			action: 'service_reviews_view',
			product_id: product_id
		},
		orderBy: {
			created_at: 'desc'
		},
		take: 1
	});

	if (!product?.isPublic && !ctx.session?.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'This product is not public'
		});
	}

	const [reviews, countFiltered, countAll, countNew, countForm1, countForm2] =
		await Promise.all([
			ctx.prisma.review.findMany({
				where,
				orderBy: orderBy,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				include: {
					answers: shouldIncludeAnswers
						? {
								include: {
									parent_answer: true
								},
								where: {
									...(input.end_date && {
										created_at: getDateWhereFromUTCRange(
											input.start_date,
											input.end_date
										)
									})
								}
						  }
						: false
				}
			}),
			ctx.prisma.review.count({ where }),
			ctx.prisma.review.count({
				where: {
					product_id: input.product_id,
					...(form_id &&
						(form?.legacy
							? { OR: [{ form_id }, { form_id: 1 }, { form_id: 2 }] }
							: { form_id }))
				}
			}),
			lastSeenReview[0]
				? ctx.prisma.review.count({
						where: {
							product_id: input.product_id,
							...(lastSeenReview[0] && {
								created_at: {
									gte: lastSeenReview[0].created_at
								}
							})
						}
				  })
				: 0,
			ctx.prisma.review.count({
				where: {
					...where,
					form_id: 1
				}
			}),
			ctx.prisma.review.count({
				where: {
					...where,
					form_id: 2
				}
			})
		]);

	if (input.needLogging) {
		const user = ctx.session?.user;
		if (user) {
			await ctx.prisma.userEvent.create({
				data: {
					user_id: parseInt(user.id),
					action: input.loggingFromMail
						? 'service_reviews_report_view'
						: 'service_reviews_view',
					product_id: product_id,
					metadata: input
				}
			});
		}
	}

	return {
		data: reviews,
		metadata: { countFiltered, countAll, countNew, countForm1, countForm2 }
	};
};
