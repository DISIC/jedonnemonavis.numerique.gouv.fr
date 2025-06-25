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
	TypeAction.service_apikeys_delete,
	TypeAction.form_config_create
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

	getLastFormReviewView: protectedProcedure
		.input(
			z.object({
				product_id: z.number(),
				form_id: z.number()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, form_id } = input;

			const lastSeenFormReview = await ctx.prisma.userEvent.findMany({
				where: {
					user_id: parseInt(ctx.session?.user?.id),
					action: 'form_reviews_view',
					product_id: product_id,
					metadata: {
						path: ['form_id'],
						equals: form_id
					}
				},
				orderBy: { created_at: 'desc' },
				take: 1
			});

			let lastLog = lastSeenFormReview;

			if (lastSeenFormReview.length === 0) {
				const lastSeenProductReview = await ctx.prisma.userEvent.findMany({
					where: {
						user_id: parseInt(ctx.session?.user?.id),
						action: 'service_reviews_view',
						product_id: product_id
					},
					orderBy: { created_at: 'desc' },
					take: 1
				});
				lastLog = lastSeenProductReview;
			}

			const user = ctx.session?.user;
			if (user) {
				await ctx.prisma.userEvent.create({
					data: {
						user_id: parseInt(user.id),
						action: 'form_reviews_view' as any,
						product_id: product_id,
						metadata: {
							form_id: form_id
						}
					}
				});
			}

			const logToReturn = lastLog.length > 1 ? [lastLog[1]] : lastLog;
			return { data: logToReturn };
		}),

	createReviewView: protectedProcedure
		.input(UserEventUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const newButton = await ctx.prisma.userEvent.create({
				data: input
			});

			return { data: newButton };
		}),

	countNewLogs: protectedProcedure
		.input(
			z.object({
				user_id: z.number().optional(),
				product_id: z.number()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, user_id } = input;

			const lastSeenLogs = await ctx.prisma.userEvent.findFirst({
				where: {
					product_id,
					user_id,
					action: 'service_logs_view'
				},
				orderBy: {
					created_at: 'desc'
				}
			});

			const countNewLogs = await ctx.prisma.userEvent.count({
				where: {
					product_id,
					...(lastSeenLogs && {
						created_at: {
							gte: lastSeenLogs?.created_at
						}
					}),
					action: {
						in: ALL_ACTIONS
					}
				}
			});

			return {
				count: countNewLogs
			};
		}),

	getList: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({
				product_id: z.number().optional(),
				page: z.number(),
				limit: z.number(),
				filterAction: z.array(z.nativeEnum(TypeAction)),
				startDate: z.string().optional(),
				endDate: z.string().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, page, limit, filterAction, startDate, endDate } =
				input;
			const skip = (page - 1) * limit;

			const whereCondition: Prisma.UserEventWhereInput = {
				OR: [
					{ product_id },
					{
						entity: {
							products: {
								some: {
									id: product_id
								}
							}
						}
					},
					{
						form: {
							is: {
								product_id: product_id
							}
						}
					}
				],
				action: {
					in: filterAction?.length > 0 ? filterAction : ALL_ACTIONS
				}
			};

			if (startDate && endDate) {
				const start = new Date(startDate);
				start.setHours(0, 0, 0, 0);
				const end = new Date(endDate);
				end.setHours(23, 59, 59, 999);
				whereCondition.created_at = {
					gte: start,
					lt: end
				};
			}

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
