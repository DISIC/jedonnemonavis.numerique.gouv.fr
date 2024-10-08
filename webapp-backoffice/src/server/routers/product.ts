import { z } from 'zod';
import {
	router,
	publicProcedure,
	protectedProcedure,
	protectedApiProcedure
} from '@/src/server/trpc';
import {
	ProductUncheckedCreateInputSchema,
	ProductUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';
import { Prisma, Product } from '@prisma/client';
import { removeAccents } from '@/src/utils/tools';

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
				filterEntityId: z.array(z.number()),
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

			const whereUserScope: Prisma.ProductWhereInput = {
				OR: [
					{
						accessRights:
							!contextUser.role.includes('admin')
								? {
										some: {
											user_email: contextUser.email,
											status: 'carrier'
										}
									}
								: {}
					},
					{
						entity: {
							adminEntityRights:
								!contextUser.role.includes('admin')
									? {
											some: {
												user_email: contextUser.email
											}
										}
									: {}
						}
					}
				]
			};

			let where: Prisma.ProductWhereInput = { ...whereUserScope };

			if (search) {
				let searchWithoutAccents = removeAccents(search);
				const searchQuery = searchWithoutAccents
					.split(' ')
					.map(word => `${word}:*`)
					.join('&');

				where = {
					AND: [
						{ ...where },
						{
							OR: [
								{
									title_formatted: {
										search: searchQuery
									}
								},
								{
									title: {
										search: searchQuery
									}
								}
							]
						}
					]
				};
			}

			if (filterEntityId.length > 0) {
				where.entity = {
					id: {
						in: filterEntityId
					}
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

			try {
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

				const countTotalUserScope = await ctx.prisma.product.count({
					where: whereUserScope
				});

				return { data: products, metadata: { count, countTotalUserScope } };
			} catch (e) {
				console.log(e);
				return { data: [], metadata: { count: 0, countTotalUserScope: 0 } };
			}
		}),

	getXWikiIds: publicProcedure
		.meta({ openapi: { method: 'GET', path: '/products/xwiki' } })
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1)
			})
		)
		.output(
			z.object({
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
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page } = input;

			const products = await ctx.prisma.product.findMany({
				take: numberPerPage,
				skip: numberPerPage * (page - 1),
				include: {
					buttons: true
				}
			});

			const count = await ctx.prisma.product.count();

			return {
				data: products.map(product => ({
					id: product.id,
					xwiki_id: product.xwiki_id,
					title: product.title,
					buttons: product.buttons.map(b => ({
						id: b.id,
						title: b.title,
						xwiki_title: b.xwiki_title
					}))
				})),
				metadata: { count }
			};
		}),

	create: protectedProcedure
		.input(ProductUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input: productPayload }) => {
			const userEmail = ctx.session?.user?.email;

			productPayload.title_formatted = removeAccents(productPayload.title);

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

			product.title_formatted = removeAccents(product.title as string);

			const updatedProduct = await ctx.prisma.product.update({
				where: { id },
				data: {
					...product
				}
			});

			return { data: updatedProduct };
		})
});
