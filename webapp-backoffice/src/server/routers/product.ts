import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';

export const productRouter = router({
	getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
		return ctx.prisma.product.findUnique({
			where: {
				id: input
			}
		});
	}),

	count: publicProcedure
		.input(z.string().optional())
		.query(async ({ ctx, input }) => {
			const userEmail = ctx.session?.user?.email;

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

			if (input) {
				const searchQuery = input.split(' ').join(' | ');
				where.title = {
					search: searchQuery
				};
			}

			const count = await ctx.prisma.product.count({ where });

			return count;
		}),

	getByPagination: publicProcedure
		.input(
			z.object({
				numberPerPage: z.number().default(10),
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
					search: searchQuery
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

			return products;
		})
});
