import type { Context } from '@/src/server/trpc';

/**
 * Returns the active classification catalogue (themes + problématiques) for the UI:
 * code → label resolution when displaying a review's class, the correction dropdown, and
 * the category filter. Flat list with parent_id so the client can build the tree.
 */
export const getCatalogueQuery = async ({ ctx }: { ctx: Context }) => {
	const categories = await ctx.prisma.classificationCategory.findMany({
		where: { active: true },
		orderBy: [{ level: 'asc' }, { parent_id: 'asc' }, { position: 'asc' }],
		select: {
			id: true,
			code: true,
			label: true,
			description: true,
			level: true,
			parent_id: true
		}
	});

	return { data: categories };
};
