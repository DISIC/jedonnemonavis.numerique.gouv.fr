import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, protectedApiProcedure } from '@/src/server/trpc';
import {
	ProductUncheckedCreateInputSchema,
	ProductUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';
import { Prisma, Product } from '@prisma/client';

export const productRouter = router({
	getById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const product = await ctx.prisma.product.findUnique({
				where: {
					id: input.id
				}
			});

			if (!product)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found'
				});

			return { data: product };
		}),

	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				sort: z.string().optional(),
				search: z.string().optional(),
				filterEntityId: z.number().optional(),
				filterByUserFavorites: z.boolean().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const contextUser = ctx.session.user;
			const {
				numberPerPage,
				page,
				sort,
				search,
				filterEntityId,
				filterByUserFavorites
			} = input;

			let orderBy: Prisma.ProductOrderByWithAggregationInput[] = [
				{
					title: 'asc'
				}
			];

			let where: Prisma.ProductWhereInput = {
				accessRights:
					contextUser.role !== 'admin'
						? {
								some: {
									user_email: contextUser.email,
									status: 'carrier'
								}
						  }
						: {}
			};

			if (search) {
				const searchQuery = search.split(' ').join(' | ');
				where.title = {
					contains: searchQuery,
					mode: 'insensitive'
				};
			}

			if (filterEntityId) {
				where.entity = {
					id: filterEntityId
				};
			}

			if (filterByUserFavorites) {
				where.favorites = {
					some: {
						user_id: parseInt(contextUser.id)
					}
				};
			}

			if (sort) {
				const values = sort.split(':');
				if (values.length === 2) {
					if (values[0].includes('.')) {
						const subValues = values[0].split('.');
						if (subValues.length === 2) {
							orderBy = [
								{
									[subValues[0]]: {
										[subValues[1]]: values[1]
									}
								}
							];
						}
					} else {
						orderBy = [
							{
								[values[0]]: values[1]
							}
						];
					}
				}
			}

			const products = await ctx.prisma.product.findMany({
				orderBy,
				where,
				take: numberPerPage,
				skip: numberPerPage * (page - 1),
				include: {
					buttons: true
				}
			});

			const count = await ctx.prisma.product.count({ where });

			return { data: products, metadata: { count } };
		}),

	create: protectedProcedure
		.input(ProductUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input: productPayload }) => {
			const userEmail = ctx.session?.user?.email;

			const product = await ctx.prisma.product.create({
				data: {
					...productPayload,
					accessRights: {
						create: [
							{
								user_email: userEmail,
								status: 'carrier'
							}
						]
					}
				}
			});

			return { data: product };
		}),

	update: protectedProcedure
		.input(
			z.object({ id: z.number(), product: ProductUncheckedUpdateInputSchema })
		)
		.mutation(async ({ ctx, input }) => {
			const { id, product } = input;

			const updatedProduct = await ctx.prisma.product.update({
				where: { id },
				data: {
					...product
				}
			});

			return { data: updatedProduct };
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

			console.log('ctx user : ', ctx.user_api)
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
