import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import {
	ButtonUncheckedCreateInputSchema,
	ButtonUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';

export const buttonRouter = router({
	getList: publicProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				isTest: z.boolean()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, isTest } = input;

			let where: Prisma.ButtonWhereInput = {
				isTest: {
					equals: !isTest ? false : undefined
				}
			};

			const entities = await ctx.prisma.button.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage
			});

			const count = await ctx.prisma.button.count({ where });

			return { data: entities, metadata: { count } };
		}),

	create: protectedProcedure
		.input(ButtonUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const newButton = await ctx.prisma.button.create({
				data: input
			});

			return { data: newButton };
		}),

	update: protectedProcedure
		.input(ButtonUncheckedUpdateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const updatedButton = await ctx.prisma.button.update({
				where: {
					id: input.id as number
				},
				data: input
			});

			return { data: updatedButton };
		})
});
