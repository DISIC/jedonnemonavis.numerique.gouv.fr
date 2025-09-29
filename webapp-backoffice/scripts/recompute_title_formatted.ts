import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const computatedString = (str: string): string => {
	return str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // strip accents
		.replace(/œ/g, 'oe')
		.replace(/Œ/g, 'Oe');
};

async function main() {
	const batchSize = parseInt(process.env.BATCH_SIZE || '500', 10);
	let lastId = 0;
	let total = 0;

	console.log(`Starting backfill with batch size=${batchSize}`);

	while (true) {
		const products = await prisma.product.findMany({
			where: { id: { gt: lastId } },
			orderBy: { id: 'asc' },
			take: batchSize,
			select: { id: true, title_formatted: true }
		});

		if (products.length === 0) break;

		const updates = products.map(p => {
			return {
				id: p.id,
				title_formatted: computatedString(p.title_formatted || '')
			};
		});

		for (const u of updates) {
			await prisma.product.update({
				where: { id: u.id },
				data: { title_formatted: u.title_formatted }
			});
		}

		lastId = products[products.length - 1].id;
		total += products.length;
		console.log(`Processed ${total} products (lastId=${lastId})`);
	}

	console.log('Backfill complete.');
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
