import { z } from 'zod';
import type { Context } from '@/src/server/trpc';

export const infoServicesQuery = async ({
	ctx
}: {
	ctx: Context;
	input: {};
}) => {
	const getAuthorizedProductIds = async (): Promise<number[]> => {
		if (ctx.api_key?.product_id) {
			return [ctx.api_key.product_id];
		}

		if (ctx.api_key?.entity_id) {
			const entity = await ctx.prisma.entity.findFirst({
				where: { id: ctx.api_key.entity_id },
				include: { products: true }
			});

			if (entity && entity.products) {
				return entity.products.map(prod => prod.id);
			}
		}

		return [];
	};

	const authorized_products_ids: number[] = await getAuthorizedProductIds();

	const products = await ctx.prisma.product.findMany({
		where: {
			id: {
				in: authorized_products_ids
			}
		},
		include: {
			entity: true,
			forms: {
				include: {
					form_template: true
				}
			}
		}
	});

	await ctx.prisma.apiKeyLog.create({
		data: {
			apikey_id: ctx.api_key?.id || 0,
			url: ctx.req.url || ''
		}
	});

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
