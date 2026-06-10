import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { classificationQueue, classificationJobId } from '../src/lib/queue';

/**
 * Full BullMQ round-trip check: enqueue a real classification job and verify a SEPARATE
 * running worker (yarn worker:classify:start) picks it up from Redis and writes the result.
 * Requires Redis + Albert + a seeded catalogue + a running classification worker.
 */
const prisma = new PrismaClient();
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
	if (!classificationQueue) {
		throw new Error('classificationQueue is null — REDIS_URL not set?');
	}

	const button = await prisma.button.findFirst({
		select: { id: true, form_id: true, form: { select: { product_id: true } } }
	});
	if (!button) throw new Error('No seeded Button. Run `npx prisma db seed`.');

	const review = await prisma.review.create({
		data: {
			product_id: button.form.product_id,
			button_id: button.id,
			form_id: button.form_id,
			user_id: 'classif-roundtrip-check',
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
			answer_text: 'Le formulaire est beaucoup trop long, trop de champs à remplir.'
		}
	});

	await classificationQueue.add(
		'classify',
		{ reviewId: review.id, reviewCreatedAt: review.created_at.toISOString() },
		{ jobId: classificationJobId(review.id) }
	);
	console.log(
		`Enqueued classification job for review ${review.id}. Waiting for the worker…`
	);

	let cls = null;
	for (let i = 0; i < 40; i++) {
		cls = await prisma.reviewClassification.findUnique({
			where: {
				review_id_review_created_at: {
					review_id: review.id,
					review_created_at: review.created_at
				}
			}
		});
		if (cls) break;
		await sleep(500);
	}

	if (cls) {
		console.log('\n✓ Worker processed the job from Redis. ReviewClassification:');
		console.log(
			JSON.stringify(
				{
					predicted_code: cls.predicted_code,
					predicted_score: cls.predicted_score,
					model_name: cls.model_name,
					status: cls.status
				},
				null,
				2
			)
		);
	} else {
		console.error('\n✗ No classification written within 20s — worker not running?');
	}

	// Cleanup
	await prisma.reviewClassification.deleteMany({
		where: { review_id: review.id, review_created_at: review.created_at }
	});
	await prisma.answer.deleteMany({ where: { review_id: review.id } });
	await prisma.review.delete({
		where: { id_created_at: { id: review.id, created_at: review.created_at } }
	});
	console.log('Cleaned up test rows.');

	if (!cls) process.exitCode = 1;
}

main()
	.catch(e => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
		process.exit(process.exitCode ?? 0);
	});
