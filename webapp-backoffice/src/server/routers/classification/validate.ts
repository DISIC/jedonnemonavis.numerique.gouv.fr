import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { checkRightToProceed } from '../product';
import { writeAnswerFacets } from '@/src/server/services/classification/es';

export const validateClassificationInputSchema = z.object({
	review_id: z.number(),
	review_created_at: z.string(), // ISO string (Review has a composite [id, created_at] key)
	objets: z.array(z.string()).default([]),
	thematiques: z.array(z.string()).default([]),
	polarite: z.array(z.enum(['positif', 'negatif'])).default([])
});

/**
 * Human validation/correction of a verbatim's FACETS. Stores the human set as facet rows with
 * `source = 'validated'` (kept alongside the `predicted` rows — the validation loop doubles as a
 * quality metric + future training set), updates polarity, and re-denormalises the validated
 * facets into Elasticsearch (`classe_source: 'validated'`).
 *
 * Works manual-first too: if no prediction exists yet, a row is created (model_name 'manual').
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

	// Resolve + validate the submitted facet codes against this product's active referential
	// (product-specific facets + global ones). Builds (axis, code) -> facet_id.
	const refFacets = await ctx.prisma.classificationFacet.findMany({
		where: { active: true, OR: [{ product_id: review.product_id }, { product_id: null }] },
		select: { id: true, axis: true, code: true }
	});
	const idByKey = new Map(refFacets.map(f => [`${f.axis}:${f.code}`, f.id] as const));

	const wanted: { axis: 'objet' | 'thematique_site'; code: string }[] = [
		...input.objets.map(code => ({ axis: 'objet' as const, code })),
		...input.thematiques.map(code => ({ axis: 'thematique_site' as const, code }))
	];
	const resolved = wanted.map(w => ({ ...w, facet_id: idByKey.get(`${w.axis}:${w.code}`) }));
	const unknown = resolved.filter(r => r.facet_id == null);
	if (unknown.length > 0) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: `Unknown facet code(s): ${unknown.map(u => `${u.axis}:${u.code}`).join(', ')}`
		});
	}

	const userId = parseInt(ctx.session!.user.id);

	// corrected if the validated set differs from the current prediction, else validated.
	const existing = await ctx.prisma.reviewClassification.findUnique({
		where: {
			review_id_review_created_at: {
				review_id: input.review_id,
				review_created_at: createdAt
			}
		},
		include: { facets: { where: { source: 'predicted' } } }
	});
	const predictedSet = new Set(existing?.facets.map(f => `${f.axis}:${f.code}`) ?? []);
	const wantedSet = new Set(wanted.map(w => `${w.axis}:${w.code}`));
	const samePolarite =
		new Set(existing?.polarite ?? []).size === input.polarite.length &&
		input.polarite.every(p => existing?.polarite.includes(p));
	const sameFacets =
		predictedSet.size === wantedSet.size && [...wantedSet].every(k => predictedSet.has(k));
	const status = existing && sameFacets && samePolarite ? 'validated' : 'corrected';

	const saved = await ctx.prisma.$transaction(async tx => {
		const rc = await tx.reviewClassification.upsert({
			where: {
				review_id_review_created_at: {
					review_id: input.review_id,
					review_created_at: createdAt
				}
			},
			update: {
				polarite: input.polarite,
				validated_by: userId,
				validated_at: new Date(),
				status
			},
			create: {
				review_id: input.review_id,
				review_created_at: createdAt,
				polarite: input.polarite,
				model_name: 'manual',
				prompt_version: 'manual',
				validated_by: userId,
				validated_at: new Date(),
				status: 'validated'
			},
			select: { id: true }
		});

		// Replace the previously-validated facets with the new human set (keep predicted rows).
		await tx.reviewClassificationFacet.deleteMany({
			where: { classification_id: rc.id, source: 'validated' }
		});
		if (resolved.length > 0) {
			await tx.reviewClassificationFacet.createMany({
				data: resolved.map(r => ({
					classification_id: rc.id,
					facet_id: r.facet_id!,
					axis: r.axis,
					code: r.code,
					source: 'validated' as const
				}))
			});
		}
		return rc;
	});

	// Re-denormalise the (now validated) facets into Elasticsearch. Best-effort.
	const verbatim = await ctx.prisma.answer.findFirst({
		where: { review_id: input.review_id, field_code: 'verbatim' },
		orderBy: { created_at: 'desc' },
		select: { id: true }
	});
	if (verbatim) {
		await writeAnswerFacets(verbatim.id, {
			objets: input.objets,
			thematiques: input.thematiques,
			polarite: input.polarite,
			pourquoi: '',
			confiance: 1,
			classe_source: 'validated'
		});
	}

	return { data: saved };
};
