import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
	EntityCreateInputSchema,
	EntityUpdateInputSchema
} from '@/prisma/generated/zod';

export const entityRouter = router({
	create: protectedProcedure
		.meta({ isAdmin: true })
		.input(EntityCreateInputSchema)
		.mutation(async ({ ctx, input: newEntity }) => {
			const entityExists = await ctx.prisma.entity.findUnique({
				where: {
					name: newEntity.name
				}
			});

			if (entityExists)
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Entity with email already exists'
				});

			const createdEntity = await ctx.prisma.entity.create({
				data: {
					...newEntity
				}
			});

			return { data: createdEntity };
		}),

	update: protectedProcedure
		.meta({ isAdmin: true })
		.input(z.object({ id: z.number(), entity: EntityUpdateInputSchema }))
		.mutation(async ({ ctx, input }) => {
			const { id, entity } = input;
			const updatedEntity = await ctx.prisma.entity.update({
				where: { id },
				data: { ...entity }
			});

			return { data: updatedEntity };
		}),

	delete: protectedProcedure
		.meta({ isAdmin: true })
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const deletedEntity = await ctx.prisma.entity.delete({
				where: { id }
			});

			return { data: deletedEntity };
		}),

	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				search: z.string().optional(),
				mine: z.boolean().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, search, mine } = input;

			let orderBy: Prisma.EntityOrderByWithAggregationInput[] = [
				{
					name: 'asc'
				}
			];

			let where: Prisma.EntityWhereInput = {
				name: {
					contains: search || '',
					mode: 'insensitive'
				}
			};

			if (mine) {
				where.id = {
					in: ctx.session.user.entities.map(e => e.id)
				};
			}

			const entities = await ctx.prisma.entity.findMany({
				where,
				take: numberPerPage,
				orderBy,
				include: {
					products: true,
					users: true
				},
				skip: (page - 1) * numberPerPage
			});

			const count = await ctx.prisma.entity.count({ where });

			return { data: entities, metadata: { count } };
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const { id } = input;
			const entity = await ctx.prisma.entity.findUnique({ where: { id } });
			return { data: entity };
		})
});
