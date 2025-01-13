import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { Prisma, TypeAction } from '@prisma/client';
import { UserEventUncheckedCreateInputSchema } from '@/prisma/generated/zod';

const SERVICE_ACTIONS: TypeAction[] = [
	TypeAction.service_create,
	TypeAction.service_update,
	TypeAction.service_archive,
	TypeAction.service_restore
];

const PRODUCT_ACTIONS: TypeAction[] = [
	TypeAction.service_invite,
	TypeAction.service_uninvite,
	TypeAction.service_button_create,
	TypeAction.service_button_update,
	TypeAction.service_apikeys_create,
	TypeAction.service_apikeys_delete
];

const ORGANISATION_ACTIONS: TypeAction[] = [
	TypeAction.organisation_update,
	TypeAction.organisation_invite,
	TypeAction.organisation_uninvite
];

const ALL_ACTIONS: TypeAction[] = [
	...SERVICE_ACTIONS,
	...PRODUCT_ACTIONS,
	...ORGANISATION_ACTIONS
  ];

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

			const whereCondition = {
				OR: [
				  { product_id },
				  {
					entity: {
						products: {
							some: {
								id: product_id,
							},
						},
					},
				  },
				],
				action: {
					in: ALL_ACTIONS
				},
				...(filterAction && { action: filterAction })
			};

			const [events, total] = await ctx.prisma.$transaction([
				ctx.prisma.userEvent.findMany({
					where: whereCondition,
					orderBy: { created_at: 'desc' },
					skip,
					take: limit,
					include: {
						user: true
					}
				}),
				ctx.prisma.userEvent.count({ where: whereCondition })
			]);

			return {
				data: events,
				pagination: {
					total
				}
			};
		})
});
