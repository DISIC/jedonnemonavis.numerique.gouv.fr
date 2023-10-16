import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { Prisma, PrismaClient, RequestMode } from '@prisma/client';
import {
	RequestModeSchema,
	UserCreateInputSchema
} from '@/prisma/generated/zod';
import crypto from 'crypto';

export async function createUserRequest(
	prisma: PrismaClient,
	user: Prisma.UserCreateInput,
	userRequest: { reason: string; mode: RequestMode }
) {
	const hashedPassword = crypto
		.createHash('sha256')
		.update(user.password)
		.digest('hex');

	user.password = hashedPassword;

	const createdUser = await prisma.user.create({
		data: {
			...user,
			active: false
		}
	});

	const createdUserRequest = prisma.userRequest.create({
		data: {
			reason: userRequest.reason,
			mode: userRequest.mode,
			user_id: createdUser.id
		}
	});

	return createdUserRequest;
}

export const userRequestRouter = router({
	getList: protectedProcedure
		.meta({ isAdmin: true })
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				sort: z.string().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const contextUser = ctx.session.user;
			const { numberPerPage, page, sort } = input;

			let orderBy: Prisma.UserRequestOrderByWithAggregationInput[] = [
				{
					created_at: 'asc'
				}
			];

			let where: Prisma.UserRequestWhereInput = {};

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

			const userRequests = await ctx.prisma.userRequest.findMany({
				orderBy,
				where,
				take: numberPerPage,
				skip: numberPerPage * (page - 1),
				include: {
					user: true
				}
			});

			const count = await ctx.prisma.userRequest.count({ where });

			return { data: userRequests, metadata: { count } };
		}),

	create: publicProcedure
		.input(
			z.object({
				userRequest: z.object({ reason: z.string(), mode: RequestModeSchema }),
				user: UserCreateInputSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userRequest, user } = input;

			const createdUserRequest = await createUserRequest(
				ctx.prisma,
				user,
				userRequest
			);

			return { data: createdUserRequest };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const deletedUserRequest = await ctx.prisma.userRequest.delete({
				where: { id }
			});

			return { data: deletedUserRequest };
		})
});
