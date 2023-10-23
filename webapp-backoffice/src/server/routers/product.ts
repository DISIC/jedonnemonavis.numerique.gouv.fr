import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import {
	ProductUncheckedCreateInputSchema,
	ProductUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

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
		})
});
