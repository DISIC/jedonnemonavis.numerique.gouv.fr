import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { classifyReview } from '../src/server/services/classification/classify-review';

/**
 * Classify a single existing review by id (e.g. to (re)classify after a manual fix or to
 * backfill a one-off). Usage: `tsx scripts/classify-review-by-id.ts <reviewId>`.
 */
const prisma = new PrismaClient();

async function main() {
	const id = parseInt(process.argv[2] ?? '', 10);
	if (Number.isNaN(id)) {
		console.error('Usage: tsx scripts/classify-review-by-id.ts <reviewId>');
		process.exit(1);
	}

	const review = await prisma.review.findFirst({
		where: { id },
		select: { id: true, created_at: true }
	});
	if (!review) throw new Error(`Review ${id} not found`);

	await classifyReview(review.id, review.created_at);
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
