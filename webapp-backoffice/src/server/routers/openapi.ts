import {
	protectedApiProcedure,
	publicProcedure,
	router
} from '@/src/server/trpc';
import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '@/src/utils/helpers';
import { fetchAndFormatData } from '@/src/utils/stats';
import { AccessRight, Product } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

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
			const authorized_products_ids: number[] = ctx.user_api.accessRights.map(
				(data: AccessRight) => {
					return data.product_id;
				}
			);

			console.log(ctx.user_api)

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
	publicData: publicProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/publicData',
				protect: false,
				enabled: true,
				summary:
					"Point d'accès retourne les données de satisfaction des usagers pour toutes les démarches faisant actuellement partie du Top 250.",
				example: {
					request: {
						field_codes: ['satisfaction', 'comprehension'],
						product_ids: [],
						start_date: '2023-01-01',
						end_date: new Date().toISOString().split('T')[0]
					}
				}
			}
		})
		.input(
			z.object({
				field_codes: z.array(z.string()),
				product_ids: z.array(z.number()),
				start_date: z.string(),
				end_date: z.string()
			})
		)
		.output(
			z.object({
				data: z.array(
					z.object({
						product_id: z.string(),
						product_name: z.string(),
						data: z.array(
							z.object({
								category: z.string(),
								label: z.string(),
								number_hits: z.array(
									z.object({
										intention: z.string(),
										label: z.string(),
										count: z.number()
									})
								)
							})
						)
					})
				)
			})
		)
		.query(async ({ ctx, input }) => {
			const { field_codes, product_ids, start_date, end_date } = input;

			const actual250 = await ctx.prisma.product.findMany({
				where: {
					isPublic: true
				}
			});
			const list_250_ids: number[] = actual250.map((data: Product) => {
				return data.id;
			});

			const result = await fetchAndFormatData({
				ctx,
				field_codes:
					field_codes.length > 0
						? field_codes
						: [
								...FIELD_CODE_BOOLEAN_VALUES.map(code => code.slug),
								...FIELD_CODE_SMILEY_VALUES.map(code => code.slug),
								...FIELD_CODE_DETAILS_VALUES.map(code => code.slug),
							],
				product_ids:
					product_ids.length > 0
						? list_250_ids.filter(value => product_ids.includes(value))
						: list_250_ids,
				start_date,
				end_date
			});

			return { data: result };
		}),

	statsUsagers: protectedApiProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/stats',
				protect: true,
				enabled: true,
				summary:
					"Ce point d'accès retourne les données de satisfaction des utilisateurs pour toutes les démarches liées au porteur du token fourni.",
				example: {
					request: {
						field_codes: ['satisfaction', 'comprehension'],
						product_ids: [],
						start_date: '2023-01-01',
						end_date: new Date().toISOString().split('T')[0]
					}
				}
			}
		})
		.input(
			z.object({
				field_codes: z.array(z.string()),
				product_ids: z.array(z.number()),
				start_date: z.string(),
				end_date: z.string()
			})
		)
		.output(
			z.object({
				data: z.array(
					z.object({
						product_id: z.string(),
						product_name: z.string(),
						data: z.array(
							z.object({
								category: z.string(),
								label: z.string(),
								number_hits: z.array(
									z.object({
										intention: z.string(),
										label: z.string(),
										count: z.number()
									})
								)
							})
						)
					})
				)
			})
		)
		.query(async ({ ctx, input }) => {
			const { field_codes, product_ids, start_date, end_date } = input;

			const authorized_products_ids: number[] = ctx.user_api.accessRights.map(
				(data: AccessRight) => {
					return data.product_id;
				}
			);

			const result = await fetchAndFormatData({
				ctx,
				field_codes:
					field_codes.length > 0
						? field_codes
						: [
								...FIELD_CODE_BOOLEAN_VALUES.map(code => code.slug),
								...FIELD_CODE_SMILEY_VALUES.map(code => code.slug),
								...FIELD_CODE_DETAILS_VALUES.map(code => code.slug)
							],
				product_ids:
					product_ids.length > 0
						? authorized_products_ids.filter(value =>
								product_ids.includes(value)
							)
						: authorized_products_ids,
				start_date,
				end_date
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
