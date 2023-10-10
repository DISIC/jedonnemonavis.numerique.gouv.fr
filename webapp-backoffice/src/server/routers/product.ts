import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { ProductUncheckedCreateInputSchema } from '@/prisma/generated/zod';

export const productRouter = router({
	getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
		return ctx.prisma.product.findUnique({
			where: {
				id: input
			}
		});
	}),

	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				sort: z.string().optional(),
				search: z.string().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const userEmail = ctx.session?.user?.email;
			const { numberPerPage, page, sort, search } = input;

			let orderBy: any = [
				{
					title: 'asc'
				}
			];

			let where: any = {
				title: {
					contains: ''
				},
				accessRights: {
					some: {
						user_email: userEmail,
						status: 'carrier'
					}
				}
			};

			if (search) {
				const searchQuery = search.split(' ').join(' | ');
				where.title = {
					contains: searchQuery
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

			return product;
		})
});