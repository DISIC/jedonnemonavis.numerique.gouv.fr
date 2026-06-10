import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { checkRightToProceed } from '../product';
import { writeAnswerClasse } from '@/src/server/services/classification/es';

export const validateClassificationInputSchema = z.object({
	review_id: z.number(),
	review_created_at: z.string(), // ISO string (Review has a composite [id, created_at] key)
	validated_code: z.string()
});

/**
 * Human validation/correction of a verbatim's class. Stores `validated_code` alongside the
 * LLM prediction (the validation loop = quality metric + future training set), and re-writes
 * the class into Elasticsearch as `classe_source: 'validated'`.
 *
 * If no prediction exists yet (manual-first classification), a row is created with the
 * validated code mirrored into the prediction fields (model_name 'manual') so the NOT NULL
 * columns hold; `status` then distinguishes the case.
 */
export const validateClassificationMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof validateClassificationInputSchema>;
}) => {
	const createdAt = new Date(input.review_created_at);

	const review = await ctx.prisma.review.findUnique({
		where: { id_created_at: { id: input.review_id, created_at: createdAt } },
		select: { product_id: true }
	});
	if (!review) {
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' });
	}

	// Access control: same gate as other product-scoped review actions.
	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id: review.product_id,
		authorizeCarrierUser: true
	});

	// The validated code must be an active level-2 problématique.
	const category = await ctx.prisma.classificationCategory.findUnique({
		where: { code: input.validated_code },
		include: { parent: true }
	});
	if (!category || category.level !== 2 || !category.active) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: `Invalid or inactive category code: ${input.validated_code}`
		});
	}
	const themeCode = category.parent?.code ?? '';

	const userId = parseInt(ctx.session!.user.id);

	const existing = await ctx.prisma.reviewClassification.findUnique({
		where: {
			review_id_review_created_at: {
				review_id: input.review_id,
				review_created_at: createdAt
			}
		}
	});

	const status =
		existing && existing.predicted_code === input.validated_code
			? 'validated'
			: 'corrected';

	const saved = await ctx.prisma.reviewClassification.upsert({
		where: {
			review_id_review_created_at: {
				review_id: input.review_id,
				review_created_at: createdAt
			}
		},
		update: {
			validated_code: input.validated_code,
			validated_by: userId,
			validated_at: new Date(),
			status
		},
		create: {
			review_id: input.review_id,
			review_created_at: createdAt,
			predicted_code: input.validated_code,
			predicted_score: 0,
			model_name: 'manual',
			prompt_version: 'manual',
			validated_code: input.validated_code,
			validated_by: userId,
			validated_at: new Date(),
			status: 'validated'
		}
	});

	// Re-denormalise the (now validated) class into Elasticsearch. Best-effort.
	const verbatim = await ctx.prisma.answer.findFirst({
		where: { review_id: input.review_id, field_code: 'verbatim' },
		orderBy: { created_at: 'desc' },
		select: { id: true }
	});
	if (verbatim) {
		await writeAnswerClasse(verbatim.id, {
			classe: input.validated_code,
			classe_theme: themeCode,
			classe_score: 1,
			classe_source: 'validated'
		});
	}

	return { data: saved };
};
