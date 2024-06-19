import { z } from 'zod';
import { router, protectedProcedure } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import {
	EntityUncheckedCreateInputSchema,
	EntityUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';
import { removeAccents } from '@/src/utils/tools';

export const entityRouter = router({
	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				isMine: z.boolean().optional(),
				sort: z.string().optional(),
				search: z.string().optional(),
				userCanCreateProduct: z.boolean().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const contextUser = ctx.session.user;
			const {
				numberPerPage,
				page,
				search,
				sort,
				isMine,
				userCanCreateProduct
			} = input;

			let where: Prisma.EntityWhereInput = {};

			if (search) {
				let searchWithoutAccents = removeAccents(search);
				const searchSplitted = searchWithoutAccents.split(' ');

				if (searchSplitted.length > 1) {
					where = {
						OR: [
							{
								name_formatted: {
									search: searchSplitted.join('&'),
									mode: 'insensitive'
								}
							},
							{
								acronym: {
									search: searchSplitted.join('&'),
									mode: 'insensitive'
								}
							}
						]
					};
				} else {
					where = {
						OR: [
							{
								name_formatted: {
									contains: searchWithoutAccents,
									mode: 'insensitive'
								}
							},
							{
								acronym: {
									contains: searchWithoutAccents,
									mode: 'insensitive'
								}
							}
						]
					};
				}
			}

			const myEntities = await ctx.prisma.entity.findMany({
				take: 10000,
				where: {
					adminEntityRights: {
						some: {
							user_email: contextUser.email
						}
					}
				}
			});

			if (isMine) {
				where.adminEntityRights = {
					some: {
						user_email: contextUser.email
					}
				};
			} else if (isMine === false) {
				where.adminEntityRights = {
					none: {
						user_email: contextUser.email
					}
				};
			}

			if (userCanCreateProduct && contextUser.role !== 'admin') {
				where.OR = [
					{
						adminEntityRights: {
							some: {
								user_email: contextUser.email
							}
						}
					},
					{
						products: {
							some: {
								accessRights: {
									some: {
										user_email: contextUser.email
									}
								}
							}
						}
					}
				];
			}

			let orderBy: Prisma.EntityOrderByWithAggregationInput[] = [
				{
					name: 'asc'
				}
			];

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

			const entities = await ctx.prisma.entity.findMany({
				where,
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				orderBy
			});

			const count = await ctx.prisma.entity.count({ where });

			return { data: entities, metadata: { count, myEntities } };
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const { id } = input;
			const entity = await ctx.prisma.entity.findUnique({ where: { id } });
			return { data: entity };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const deletedEntity = await ctx.prisma.entity.delete({
				where: { id }
			});

			return { data: deletedEntity };
		}),

	create: protectedProcedure
		.input(EntityUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input: entityPayload }) => {
			const userEmail = ctx.session?.user?.email;

			const existsEntity = await ctx.prisma.entity.findUnique({
				where: {
					name: entityPayload.name
				}
			});

			if (existsEntity)
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Entity with this name already exists'
				});

			entityPayload.name_formatted = removeAccents(entityPayload.name);

			const entity = await ctx.prisma.entity.create({
				data: {
					...entityPayload,
					adminEntityRights:
						ctx.session?.user?.role !== 'admin'
							? {
									create: [
										{
											user_email: userEmail
										}
									]
								}
							: {}
				}
			});

			return { data: entity };
		}),

	update: protectedProcedure
		.input(
			z.object({ id: z.number(), entity: EntityUncheckedUpdateInputSchema })
		)
		.mutation(async ({ ctx, input }) => {
			const { id, entity } = input;

			const existsEntity = await ctx.prisma.entity.findUnique({
				where: {
					name: typeof entity.name === 'string' ? entity.name : undefined
				}
			});

			if (existsEntity && existsEntity.id !== entity.id)
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Entity with this name already exists'
				});

			entity.name_formatted = removeAccents(entity.name as string);

			const updatedEntity = await ctx.prisma.entity.update({
				where: { id },
				data: {
					...entity
				}
			});

			return { data: updatedEntity };
		})
});
