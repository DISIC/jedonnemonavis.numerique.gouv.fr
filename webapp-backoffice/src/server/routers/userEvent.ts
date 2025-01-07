import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { Prisma, TypeAction } from '@prisma/client';
import { UserEventUncheckedCreateInputSchema } from '@/prisma/generated/zod';

export const userEventRouter = router({
	getLastReviewView: protectedProcedure
		.input(
			z.object({
				product_id: z.number().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id } = input;

			let where: Prisma.UserEventWhereInput = {};

			if (product_id) {
				where = {
					user_id: parseInt(ctx.session?.user?.id),
					action: 'service_reviews_view',
					product_id: product_id
				};
			}

			const reviewViewLog = await ctx.prisma.userEvent.findMany({
				where,
				orderBy: {
					created_at: 'desc'
				},
				take: 1
			});

			return { data: reviewViewLog };
		}),

	createReviewView: protectedProcedure
		.input(UserEventUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const newButton = await ctx.prisma.userEvent.create({
				data: input
			});

			return { data: newButton };
		}),

	getList: protectedProcedure
		.input(
			z.object({
				product_id: z.number().optional(),
				page: z.number(),
				limit: z.number(),
				filterAction: z.nativeEnum(TypeAction).optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, page, limit, filterAction } = input;
			const skip = (page - 1) * limit;
			const userId = ctx.session?.user?.id;

			const current_product = await ctx.prisma.product.findUnique({
				where: {
					id: product_id
				}
			});

			const baseWhereCondition = {
				...(userId && { user_id: parseInt(userId) })
			};

			const [events, total] = await ctx.prisma.$transaction([
				ctx.prisma.userEvent.findMany({
					where: {
						OR: [
							{
								...baseWhereCondition,
								action: {
									in: [
										TypeAction.service_create,
										TypeAction.service_update,
										TypeAction.service_archive,
										TypeAction.service_restore
									]
								}
							},
							{
								...baseWhereCondition,
								product_id: current_product?.id,
								action: {
									in: [
										TypeAction.service_invite,
										TypeAction.service_uninvite,

										TypeAction.service_button_create,
										TypeAction.service_apikeys_create,
										TypeAction.service_apikeys_delete
									]
								}
							},
							{
								...baseWhereCondition,
								entity_id: current_product?.entity_id,
								action: {
									in: [
										TypeAction.organisation_create,
										TypeAction.organisation_update,
										TypeAction.organisation_invite,
										TypeAction.organisation_uninvite
									]
								}
							}
						],
						...(filterAction && { action: filterAction })
					},
					orderBy: {
						created_at: 'desc'
					},
					skip,
					take: limit
				}),
				ctx.prisma.userEvent.count({
					where: {
						OR: [
							{
								...baseWhereCondition,
								action: {
									in: [
										TypeAction.service_create,
										TypeAction.service_update,
										TypeAction.service_archive,
										TypeAction.service_restore,
										TypeAction.service_apikeys_create
									]
								}
							},
							{
								...baseWhereCondition,
								product_id: product_id,
								action: {
									in: [
										TypeAction.service_invite,
										TypeAction.service_uninvite,
										TypeAction.organisation_create,
										TypeAction.organisation_update,
										TypeAction.organisation_invite,
										TypeAction.organisation_uninvite,
										TypeAction.service_button_create,
										TypeAction.service_apikeys_create,
										TypeAction.service_apikeys_delete
									]
								}
							},
							{
								...baseWhereCondition,
								entity_id: current_product?.entity_id,
								action: {
									in: [
										TypeAction.organisation_create,
										TypeAction.organisation_update,
										TypeAction.organisation_invite,
										TypeAction.organisation_uninvite
									]
								}
							}
						],
						...(filterAction && { action: filterAction })
					}
				})
			]);

			return {
				data: events,
				pagination: {
					total
				}
			};
		})
});
