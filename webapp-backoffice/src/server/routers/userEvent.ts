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
				limit: z.number()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, page, limit } = input;
			const skip = (page - 1) * limit;
			const userId = ctx.session?.user?.id;

			// Conditions communes
			const baseWhereCondition = {
				...(userId && { user_id: parseInt(userId) })
			};

			// Requête unifiée avec Prisma
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
								product_id: product_id,
								action: {
									in: [
										TypeAction.service_invite,
										TypeAction.service_uninvite,
										TypeAction.organisation_create,
										TypeAction.organisation_update,
										TypeAction.organisation_invite,
										TypeAction.organisation_uninvite,
										TypeAction.service_button_create
									]
								}
							}
						]
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
										TypeAction.service_restore
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
										TypeAction.service_button_create
									]
								}
							}
						]
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
