import type { Context } from '@/src/server/trpc';
import { Prisma, TypeAction } from '@prisma/client';
import { z } from 'zod';
import { ALL_ACTIONS } from './constants';

export const getEventListInputSchema = z.object({
	product_id: z.number().optional(),
	page: z.number(),
	limit: z.number(),
	filterAction: z.array(z.nativeEnum(TypeAction)),
	startDate: z.string().optional(),
	endDate: z.string().optional()
});

export const getEventListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getEventListInputSchema>;
}) => {
	const { product_id, page, limit, filterAction, startDate, endDate } = input;
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
};
