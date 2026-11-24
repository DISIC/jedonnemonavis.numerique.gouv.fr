import { PrismaClient } from '@prisma/client';
import { seedClassificationCatalog } from '../prisma/seeds/classification-catalog';

const prisma = new PrismaClient();

async function main() {
	console.log('[seed:classification] Seeding facet referential…');
	const { objets, thematiques } = await seedClassificationCatalog(prisma);
	console.log(
		`[seed:classification] Done — ${thematiques} thématiques site (global) upserted, ${objets} objets (product-specific objets are imported separately).`
	);
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
