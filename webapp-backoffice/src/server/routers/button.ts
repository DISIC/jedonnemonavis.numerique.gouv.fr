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
				form_id: z.number().optional(),
				isTest: z.boolean(),
				filterByTitle: z.string().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, form_id, isTest, filterByTitle } = input;

			let where: Prisma.ButtonWhereInput = {
				isTest: {
					equals: !isTest ? false : undefined
				}
			};

			if (form_id) {
				where.form_id = form_id;
			}

			const entities = await ctx.prisma.button.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				orderBy: {
					title: filterByTitle === 'title:asc' ? 'asc' : 'desc'
				},
				include: {
					form: true
				}
			});

			const count = await ctx.prisma.button.count({ where });

			return { data: entities, metadata: { count } };
		}),

	getById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const { id } = input;

			const button = await ctx.prisma.button.findUnique({
				where: {
					id
				}
			});

			return { data: button };
		}),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(ButtonUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const newButton = await ctx.prisma.button.create({
				data: input,
				include: {
					form: true
				}
			});

			return { data: newButton };
		}),

	update: protectedProcedure
		.meta({ logEvent: true })
		.input(ButtonUncheckedUpdateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const updatedButton = await ctx.prisma.button.update({
				where: {
					id: input.id as number
				},
				data: input,
				include: {
					form: true
				}
			});

			return { data: updatedButton };
		})
});
