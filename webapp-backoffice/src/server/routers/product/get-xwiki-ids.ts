import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getProductXWikiIdsInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1)
});

export const getProductXWikiIdsOutputSchema = z.object({
	data: z.array(
		z.object({
			id: z.number(),
			xwiki_id: z.number().nullable(),
			title: z.string(),
			buttons: z.array(
				z.object({
					id: z.number(),
					title: z.string(),
					xwiki_title: z.string().nullable()
				})
			)
		})
	),
	metadata: z.object({ count: z.number() })
});

export const getProductXWikiIdsQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getProductXWikiIdsInputSchema>;
}) => {
	const { numberPerPage, page } = input;

	const products = await ctx.prisma.product.findMany({
		take: numberPerPage,
		skip: numberPerPage * (page - 1),
		include: {
			forms: {
				include: {
					buttons: true
				}
			}
		}
	});

	const count = await ctx.prisma.product.count();

	return {
		data: products.map(product => ({
			id: product.id,
			xwiki_id: product.xwiki_id,
			title: product.title,
			buttons: product.forms[0].buttons.map(b => ({
				id: b.id,
				title: b.title,
				xwiki_title: b.xwiki_title
			}))
		})),
		metadata: { count }
	};
};
