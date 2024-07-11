import {
	protectedApiProcedure,
	publicProcedure,
	router
} from '@/src/server/trpc';
import { ZOpenApiStatsOutput } from '@/src/types/custom';
import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '@/src/utils/helpers';
import { fetchAndFormatData, FetchAndFormatDataProps } from '@/src/utils/stats';
import { AccessRight, Product } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const maxNbProducts = 10;

export const openAPIRouter = router({
	infoDemarches: protectedApiProcedure
		.meta({
			openapi: {
				method: 'GET',
				path: '/demarches',
				protect: true,
				enabled: true,
				summary: "Point d'accès informations démarches.",
				example: {
					request: {}
				}
			}
		})
		.input(z.object({}))
		.output(
			z.object({
				data: z.array(
					z.object({
						id: z.number().int(),
						title: z.string(),
						entity: z.string()
					})
				)
			})
		)
		.query(async ({ ctx, input }) => {
			const getAuthorizedProductIds = async (): Promise<number[]> => {
				if (ctx.api_key.product_id) {
					return [ctx.api_key.product_id];
				}

				if (ctx.api_key.entity_id) {
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
					entity: true
				}
			});

			await ctx.prisma.apiKeyLog.create({
				data: {
					apikey_id: ctx.api_key.id,
					url: ctx.req.url || ''
				}
			});

			return {
				data: products.map(prod => {
					return {
						id: prod.id,
						title: prod.title,
						entity: prod.entity.name
					};
				})
			};
		}),

	statsUsagers: protectedApiProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/stats',
				protect: true,
				enabled: true,
				summary:
					"Ce point d'accès retourne les données de satisfaction des utilisateurs pour toutes les démarches liée à la clé fournie.",
				example: {
					request: {
						field_codes: ['satisfaction', 'comprehension', 'contact_tried'],
						product_ids: [],
						inteval: undefined,
						start_date: '2023-01-01',
						end_date: new Date().toISOString().split('T')[0],
						interval: 'none'
					}
				}
			}
		})
		.input(
			z.object({
				field_codes: z.array(z.string()),
				product_ids: z.array(z.number()),
				start_date: z.string(),
				end_date: z.string(),
				interval: z.enum(['day', 'week', 'month', 'year', 'none'])
			})
		)
		.output(ZOpenApiStatsOutput)
		.query(async ({ ctx, input }) => {
			const { field_codes, product_ids, start_date, end_date, interval } =
				input;

			const getAuthorizedProductIds = async (): Promise<number[]> => {
				if (ctx.api_key.product_id) {
					return [ctx.api_key.product_id];
				}

				if (ctx.api_key.entity_id) {
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

			const allFields = [
				...FIELD_CODE_BOOLEAN_VALUES,
				...FIELD_CODE_SMILEY_VALUES,
				...FIELD_CODE_DETAILS_VALUES
			];

			let fetchParams: FetchAndFormatDataProps = {
				ctx,
				field_codes:
					field_codes.length > 0
						? allFields.filter(f => field_codes.includes(f.slug))
						: allFields,
				start_date,
				end_date,
				interval
			};

			if (
				!(ctx.api_key.scope !== 'admin' ? authorized_products_ids : product_ids)
					.length ||
				(ctx.api_key.scope !== 'admin' ? authorized_products_ids : product_ids)
					.length > maxNbProducts
			) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Veuillez réduire le nombre de services requêtés (max ${maxNbProducts})`
				});
			}

			if (ctx.api_key.scope !== 'admin') {
				fetchParams.product_ids =
					product_ids.length > 0
						? authorized_products_ids.filter(value =>
								product_ids.includes(value)
							)
						: authorized_products_ids;
			} else {
				fetchParams.product_ids = product_ids;
			}

			const result = await fetchAndFormatData(fetchParams);

			await ctx.prisma.apiKeyLog.create({
				data: {
					apikey_id: ctx.api_key.id,
					url: ctx.req.url || ''
				}
			});

			return { data: result };
		}),

	setTop250: protectedApiProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/setTop250',
				protect: true,
				enabled: true
			}
		})
		.input(
			z.object({
				product_ids: z.array(z.number())
			})
		)
		.output(
			z.object({
				result: z.object({
					has_down: z.array(z.number()),
					has_up: z.array(z.number())
				})
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { product_ids } = input;

			if (ctx.user_api.role !== 'admin') {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You need to be admin to perform this action'
				});
			}

			const actual250 = await ctx.prisma.product.findMany({
				where: {
					isPublic: true
				}
			});

			const list_actual_250: number[] = actual250.map((data: Product) => {
				return data.id;
			});

			const need_up = product_ids.filter(a => !list_actual_250.includes(a));
			const need_down = list_actual_250.filter(a => !product_ids.includes(a));

			await ctx.prisma.product.updateMany({
				where: {
					id: {
						in: need_down
					}
				},
				data: {
					isPublic: false
				}
			});

			await ctx.prisma.product.updateMany({
				where: {
					id: {
						in: need_up
					}
				},
				data: {
					isPublic: true
				}
			});

			return {
				result: {
					has_down: need_down,
					has_up: need_up
				}
			};
		})
});
