import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/src/server/trpc';
import { Prisma, PrismaClient, RequestMode } from '@prisma/client';
import {
	RequestModeSchema,
	UserCreateInputSchema,
	UserRequestUpdateInputSchema
} from '@/prisma/generated/zod';
import crypto from 'crypto';
import { sendMail } from '@/src/utils/mailer';
import { getUserRequestEmailHtml } from '@/src/utils/tools';

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
			user_email: createdUser.email,
			user_email_copy: createdUser.email
		}
	});

	return createdUserRequest;
}

export async function updateUserRequest(
	prisma: PrismaClient,
	id: number,
	userRequest: Prisma.UserRequestUpdateInput,
	createDomain: boolean
) {
	const updatedUserRequest = await prisma.userRequest.update({
		where: { id },
		data: userRequest,
		include: {
			user: true
		}
	});

	if (updatedUserRequest.user !== null) {
		if (updatedUserRequest.status === 'accepted') {
			const updatedUser = await prisma.user.update({
				where: { id: updatedUserRequest.user.id },
				data: {
					active: true
				}
			});

			if (createDomain) {
				await prisma.whiteListedDomain.create({
					data: {
						domain: updatedUserRequest.user.email.split('@')[1]
					}
				});
			}

			await sendMail(
				`Votre demande d'accès sur "Je donne mon avis" a été acceptée`,
				updatedUser.email,
				getUserRequestEmailHtml(),
				`Cliquez sur ce lien pour accédez à votre compte : ${process.env.NODEMAILER_BASEURL}/login`
			);
		} else if (updatedUserRequest.status === 'refused') {
			await prisma.userRequest.update({
				where: { id },
				data: { user_email: null }
			});

			await prisma.user.delete({
				where: { id: updatedUserRequest.user.id }
			});
		}
	}

	return updatedUserRequest;
}

export const userRequestRouter = router({
	getList: protectedProcedure
		.meta({ isAdmin: true })
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				sort: z.string().optional(),
				displayProcessed: z.boolean()
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, sort, displayProcessed } = input;

			let orderBy: Prisma.UserRequestOrderByWithAggregationInput[] = [
				{
					created_at: 'asc'
				}
			];

			let where: Prisma.UserRequestWhereInput = {
				status: displayProcessed ? undefined : 'pending'
			};

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

	update: protectedProcedure
		.meta({ isAdmin: true })
		.input(
			z.object({
				id: z.number(),
				userRequest: UserRequestUpdateInputSchema,
				createDomain: z.boolean().default(false)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, userRequest, createDomain } = input;

			const updatedUserRequest = await updateUserRequest(
				ctx.prisma,
				id,
				userRequest,
				createDomain
			);

			return { data: updatedUserRequest };
		}),

	delete: protectedProcedure
		.meta({ isAdmin: true })
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const deletedUserRequest = await ctx.prisma.userRequest.delete({
				where: { id }
			});

			return { data: deletedUserRequest };
		})
});
