import type { PrismaClient } from '@prisma/client';
import type { ClassificationCategoryLite } from '@/src/lib/albert';

/**
 * Load the active level-2 catalogue (problématiques) with their parent theme label, in the
 * shape the Albert client expects. Used by the classification worker (and reusable by any
 * other classification entry point).
 */
export async function loadActiveCatalogue(
	prisma: PrismaClient
): Promise<ClassificationCategoryLite[]> {
	const cats = await prisma.classificationCategory.findMany({
		where: { level: 2, active: true },
		include: { parent: true },
		orderBy: [{ parent_id: 'asc' }, { position: 'asc' }]
	});

	return cats.map(c => ({
		code: c.code,
		label: c.label,
		description: c.description,
		theme_label: c.parent?.label ?? ''
	}));
}
