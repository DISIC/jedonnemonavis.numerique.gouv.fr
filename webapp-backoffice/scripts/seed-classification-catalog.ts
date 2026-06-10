import { PrismaClient } from '@prisma/client';
import { seedClassificationCatalog } from '../prisma/seeds/classification-catalog';

const prisma = new PrismaClient();

async function main() {
	console.log('[seed:classification] Seeding classification catalogue…');
	const { themes, problematiques } = await seedClassificationCatalog(prisma);
	console.log(
		`[seed:classification] Done — ${themes} thèmes, ${problematiques} problématiques upserted.`
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
