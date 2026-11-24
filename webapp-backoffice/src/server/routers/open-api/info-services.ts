import { z } from 'zod';
import type { Context } from '@/src/server/trpc';
import { getAuthorizedProductIds } from './utils';

export const infoServicesQuery = async ({
	ctx
}: {
	ctx: Context;
	input: {};
}) => {
	const authorized_products_ids: number[] = await getAuthorizedProductIds(ctx);

	const products = await ctx.prisma.product.findMany({
		where: {
			id: {
				in: authorized_products_ids
			}
		},
		include: {
			entity: true,
			// Les formulaires supprimés sont exclus : GET /avis répond 404 dessus,
			// donc les exposer ici ne ferait que livrer aux partenaires des form_id
			// inexploitables.
			forms: {
				where: {
					deleted_at: null,
					isDeleted: { not: true }
				},
				include: {
					form_template: true
				}
			}
		}
	});

	// La journalisation est assurée par le wrapper HTTP des open API
	// (`pages/api/open-api/[...trpc].ts`), pas ici.

	return {
		data: products.map(prod => {
			return {
				id: prod.id,
				title: prod.title,
				entity: prod.entity.name,
				forms: prod.forms.map(form => {
					return {
						id: form.id,
						title: form.title || form.form_template.title
					};
				})
			};
		})
	};
};

export const infoServicesInputSchema = z.object({});

export const infoServicesOutputSchema = z.object({
	data: z.array(
		z.object({
			id: z.number().int(),
			title: z.string(),
			entity: z.string(),
			forms: z.array(
				z.object({
					id: z.number(),
					title: z.string()
				})
			)
		})
	)
});
