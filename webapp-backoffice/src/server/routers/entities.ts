import { entities } from './../../../prisma/seeds/entities';
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';

export const entityRouter = router({
	getList: publicProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				search: z.string().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, search } = input;

			let where: Prisma.EntityWhereInput = {
				name: {
					contains: search || ''
				}
			};

			const entities = await ctx.prisma.entity.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage
			});

			const count = await ctx.prisma.entity.count({ where });

			return { data: entities, metadata: { count } };
		})
});
