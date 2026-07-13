import type { Context } from '@/src/server/trpc';
import { formatWhereAndOrder } from '@/src/utils/reviews';
import { z } from 'zod';

export const countReviewsInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	product_id: z.number().optional(),
	form_id: z.number().optional(),
	shouldIncludeAnswers: z.boolean().optional().default(false),
	mustHaveVerbatims: z.boolean().optional().default(false),
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

export const countReviewsOutputSchema = z.object({
	metadata: z.object({
		countFiltered: z.number(),
		countAll: z.number(),
		countForm1: z.number(),
		countForm2: z.number()
	})
});

export const countReviewsQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof countReviewsInputSchema>;
}) => {
	const { form_id } = input;

	const form = await ctx.prisma.form.findUnique({
		where: {
			id: form_id
		}
	});

	const { where } = formatWhereAndOrder(input, !!form?.legacy);

	const [countFiltered, countAll, countForm1, countForm2] = await Promise.all([
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
		ctx.prisma.review.count({
			where: {
				...where,
				form_id: 1
			}
		}),
		ctx.prisma.review.count({
			where: {
				...where,
				OR: [{ form_id }, { form_id: 2 }]
			}
		})
	]);

	return {
		metadata: { countFiltered, countAll, countForm1, countForm2 }
	};
};
