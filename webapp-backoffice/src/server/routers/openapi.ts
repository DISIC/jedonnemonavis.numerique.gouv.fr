import { z } from 'zod';
import {
	router,
	publicProcedure,
	protectedApiProcedure
} from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { AccessRight, Product } from '@prisma/client';
import { fetchAndFormatData } from '@/src/utils/stats';
import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '@/src/utils/helpers';

import fs from 'fs/promises';

const description = `Ce point d'accès offre les options de filtrage suivantes : <br />
                    <ul>
                        <li>
                            <b>filed_codes : </b> Les codes des questions posées aux utilisateurs. Si vide, retourne les données pour l'esemble des codes. <br />
                            Voici la correspondance entre les field_codes et les questions : <br />
                            ${[
															...FIELD_CODE_BOOLEAN_VALUES,
															...FIELD_CODE_SMILEY_VALUES
														]
															.map(code => {
																return `- ${code.slug} : ${code.question} <br />`;
															})
															.join()
															.replace(/,/g, '')}
                        </li>
                        <li>
                            <b>product_ids : </b> Les ids des produits sur lesquels vous souhaitez filtrer les résultats. Si vide, retourne l'ensemble des produits du scope.
                        </li>
                        <li>
                            <b>start_date : </b> Date de début.
                        </li>
                        <li>
                            <b>end_date : </b> Date de fin.
                        </li>
                    </ul>`;

export const openAPIRouter = router({
	publicData: publicProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/publicData',
				protect: false,
				enabled: true,
				tags: ['public'],
				summary:
					"Ce point d'accès retourne les données de satisfaction des utilisateurs pour toutes les démarches faisant actuellement partie du Top 250.",
				description: description,
				example: {
					request: {
						field_codes: ['satisfaction', 'comprehension'],
						product_ids: [1, 2, 3],
						start_date: '2023-01-01',
						end_date: '2024-01-01'
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
					is_top_250: true
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
								...FIELD_CODE_SMILEY_VALUES.map(code => code.slug)
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

	privateData: protectedApiProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: '/privateData',
				protect: true,
				enabled: true,
				tags: ['privé'],
				summary:
					"Ce point d'accès retourne les données de satisfaction des utilisateurs pour toutes les démarches liées au porteur du token fourni.",
				description: description,
				example: {
					request: {
						field_codes: ['satisfaction', 'comprehension'],
						product_ids: [1, 2, 3],
						start_date: '2023-01-01',
						end_date: '2024-01-01'
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
					is_top_250: true
				}
			});

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
								...FIELD_CODE_SMILEY_VALUES.map(code => code.slug)
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
				enabled: true,
				tags: ['system']
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
					is_top_250: true
				}
			});

			const list_actual_250: number[] = actual250.map((data: Product) => {
				return data.id;
			});

			const need_up = product_ids.filter(a => !list_actual_250.includes(a));
			const need_down = list_actual_250.filter(a => !product_ids.includes(a));

			const down_products = await ctx.prisma.product.updateMany({
				where: {
					id: {
						in: need_down
					}
				},
				data: {
					is_top_250: false
				}
			});

			const up_products = await ctx.prisma.product.updateMany({
				where: {
					id: {
						in: need_up
					}
				},
				data: {
					is_top_250: true
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
