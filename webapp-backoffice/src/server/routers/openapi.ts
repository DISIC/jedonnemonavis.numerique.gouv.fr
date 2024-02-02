import { z } from 'zod';
import { router, publicProcedure, protectedApiProcedure } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { AccessRight, Product } from '@prisma/client';
import { fetchAndFormatData } from '@/src/utils/stats';
import { FIELD_CODE_BOOLEAN_VALUES, FIELD_CODE_DETAILS_VALUES, FIELD_CODE_SMILEY_VALUES } from '@/src/utils/helpers';

export const openAPIRouter = router({

    publicData: publicProcedure
        .meta({ openapi: { 
			method: "POST", 
			path: "/publicData",
			protect: false,
			enabled: true
		} })
        .input(
            z.object({
              field_codes: z.array(z.string()),
              product_ids: z.array(z.number()),
              start_date: z.string(),
              end_date: z.string(),
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
                        z.object(
                            {
                                intention: z.string(),
                                label: z.string(),
                                count: z.number()
                            }
                        )
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
        })
        const list_250_ids: number[] = actual250.map((data: Product) => {return data.id})

        const result = await fetchAndFormatData({
            ctx, 
            field_codes: field_codes.length > 0 ? field_codes : [ ...FIELD_CODE_BOOLEAN_VALUES, ...FIELD_CODE_SMILEY_VALUES], 
            product_ids: product_ids.length > 0 ? product_ids : list_250_ids, 
            start_date, 
            end_date
        })

        return { data: result };
    }),

    privateData: protectedApiProcedure
        .meta({ openapi: { 
			method: "POST", 
			path: "/privateData",
			protect: true,
			enabled: true
		} })
        .input(
            z.object({
              field_codes: z.array(z.string()),
              product_ids: z.array(z.number()),
              start_date: z.string(),
              end_date: z.string(),
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
                        z.object(
                            {
                                intention: z.string(),
                                label: z.string(),
                                count: z.number()
                            }
                        )
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
        })

        console.log('userl linked to api', ctx.user_api)

        const result = await fetchAndFormatData({
            ctx, 
            field_codes: field_codes.length > 0 ? field_codes : [ ...FIELD_CODE_BOOLEAN_VALUES, ...FIELD_CODE_SMILEY_VALUES],
            product_ids: product_ids.length > 0 ? product_ids : ctx.user_api.accessRights.map((data: AccessRight) => {return data.product_id}), 
            start_date, 
            end_date
        })
        
        return { data: result };
    }),

	setTop250: protectedApiProcedure
		.meta({ openapi: { 
			method: "POST", 
			path: "/setTop250",
			protect: true,
			enabled: true
		} })
		.input(
			z.object(
				{
					product_ids: z.array(z.number())
				}
			)
		)
		.output(
			z.object(
				{
					result: z.object(
						{
							has_down: z.array(z.number()),
							has_up: z.array(z.number())
						}
					)
				}
			)
		)
		.mutation(async ({ ctx, input }) => {
			const {product_ids} = input

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
			})

			const list_actual_250: number[] = actual250.map((data: Product) => {return data.id})

			const need_up = product_ids.filter(a => !list_actual_250.includes(a))
			const need_down = list_actual_250.filter(a => !product_ids.includes(a))

			const down_products = await ctx.prisma.product.updateMany({
				where: {
					id: {
						in: need_down
					}
				},
				data: {
					is_top_250: false
				}
			})

			const up_products = await ctx.prisma.product.updateMany({
				where: {
					id: {
						in: need_up
					}
				},
				data: {
					is_top_250: true
				}
			})

			return {result: {
				has_down: need_down,
				has_up: need_up
			}}
		})
});
