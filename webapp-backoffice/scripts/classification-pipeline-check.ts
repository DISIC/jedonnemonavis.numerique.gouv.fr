import { PrismaClient } from '@prisma/client';
import { classifyReview } from '../src/server/services/classification/classify-review';

/**
 * Local check of the classification worker's core path WITHOUT Redis: create a throwaway
 * review + verbatim, run the real `classifyReview()` (load verbatim → Albert → upsert
 * ReviewClassification), read the row back, then clean up. Run: `yarn tsx
 * scripts/classification-pipeline-check.ts`. Requires a seeded catalogue + a seeded
 * product/form/button (ids resolved dynamically) + ALBERT_* env.
 */

const prisma = new PrismaClient();

async function main() {
	// Resolve a valid product/form/button chain from seeded data.
	const button = await prisma.button.findFirst({
		select: { id: true, form_id: true, form: { select: { product_id: true } } }
	});
	if (!button) {
		throw new Error('No seeded Button found. Run `npx prisma db seed` first.');
	}
	const productId = button.form.product_id;

	const review = await prisma.review.create({
		data: {
			product_id: productId,
			button_id: button.id,
			form_id: button.form_id,
			user_id: 'classif-pipeline-check',
			has_verbatim: true
		}
	});

	await prisma.answer.create({
		data: {
			review_id: review.id,
			review_created_at: review.created_at,
			field_code: 'verbatim',
			field_label: 'Verbatim',
			answer_item_id: 0,
			kind: 'text',
			answer_text:
				"Impossible de me connecter avec FranceConnect, le bouton ne répond pas."
		}
	});

	console.log(`Created test review ${review.id}. Running classifyReview()…`);
	await classifyReview(review.id, review.created_at);

	const classification = await prisma.reviewClassification.findUnique({
		where: {
			review_id_review_created_at: {
				review_id: review.id,
				review_created_at: review.created_at
			}
		}
	});

	console.log('\nReviewClassification row:');
	console.log(
		JSON.stringify(
			{
				predicted_code: classification?.predicted_code,
				predicted_score: classification?.predicted_score,
				model_name: classification?.model_name,
				prompt_version: classification?.prompt_version,
				status: classification?.status
			},
			null,
			2
		)
	);

	// Cleanup (order matters: classification + answers before the review).
	await prisma.reviewClassification.deleteMany({
		where: { review_id: review.id, review_created_at: review.created_at }
	});
	await prisma.answer.deleteMany({ where: { review_id: review.id } });
	await prisma.review.delete({
		where: { id_created_at: { id: review.id, created_at: review.created_at } }
	});
	console.log('\nCleaned up test rows.');

	if (!classification) {
		throw new Error('No ReviewClassification row was written — pipeline FAILED.');
	}
	console.log('✓ Pipeline OK (review → verbatim → Albert → ReviewClassification).');
}

main()
	.catch(e => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
		// Force exit: the ES client may keep idle sockets alive otherwise.
		process.exit(process.exitCode ?? 0);
	});
