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
import {
	getUserRequestAcceptedEmailHtml,
	getUserRequestRefusedEmailHtml
} from '@/src/utils/emails';
import { generateValidationToken, makeRelationFromUserInvite } from './user';

export async function createUserRequest(
	prisma: PrismaClient,
	user: Prisma.UserCreateInput,
	userRequest: { reason: string; mode: RequestMode; inviteToken?: string }
) {
	const hashedPassword = crypto
		.createHash('sha256')
		.update(user.password)
		.digest('hex');

	user.password = hashedPassword;

	const createdUser = await prisma.user.create({
		data: {
			...user,
			email: user.email.toLowerCase(),
			active: false,
			notifications: true,
			notifications_frequency: 'weekly'
		}
	});

	const createdUserRequest = prisma.userRequest.create({
		data: {
			reason: userRequest.reason,
			mode: userRequest.mode,
			user_id: createdUser.id,
			user_email_copy: createdUser.email.toLowerCase()
		}
	});

	if (userRequest.inviteToken) {
		await makeRelationFromUserInvite(prisma, createdUser);
	}

	return createdUserRequest;
}

export async function updateUserRequest(
	prisma: PrismaClient,
	id: number,
	userRequest: Prisma.UserRequestUpdateInput,
	createDomain: boolean,
	message?: string
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
			/*const updatedUser = await prisma.user.update({
				where: { id: updatedUserRequest.user.id },
				data: {
					active: true
				}
			});*/

			const foundUser = await prisma.user.findFirst({
				where: { id: updatedUserRequest.user.id}
			})

			const token = await generateValidationToken(
				prisma,
				updatedUserRequest.user.id
			);

			if (createDomain) {
				const newDomain = updatedUserRequest.user.email
					.toLowerCase()
					.split('@')[1];
				await prisma.whiteListedDomain.upsert({
					where: { domain: newDomain },
					create: { domain: newDomain },
					update: {}
				});
			}

			if(foundUser)
			await sendMail(
				`Votre demande d'accès sur « Je donne mon avis » a été acceptée`,
				foundUser?.email.toLowerCase(),
				getUserRequestAcceptedEmailHtml(token),
				`Cliquez sur ce lien pour valider votre compte : ${process.env.NODEMAILER_BASEURL}/register/validate?${new URLSearchParams({ token })}`
			);
		} else if (updatedUserRequest.status === 'refused') {
			await prisma.userRequest.update({
				where: { id },
				data: { user_id: null }
			});

			await prisma.user.delete({
				where: { id: updatedUserRequest.user.id }
			});

			await sendMail(
				`Votre demande d'accès sur « Je donne mon avis » a été refusée`,
				updatedUserRequest.user.email.toLowerCase(),
				getUserRequestRefusedEmailHtml(message),
				`Votre demande d'accès a été refusée${
					message ? ` pour la raison suivante : ${message}` : '.'
				}`
			);
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
				userRequest: z.object({
					reason: z.string(),
					mode: RequestModeSchema,
					inviteToken: z.string().optional()
				}),
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
				createDomain: z.boolean().default(false),
				message: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, userRequest, createDomain, message } = input;

			const updatedUserRequest = await updateUserRequest(
				ctx.prisma,
				id,
				userRequest,
				createDomain,
				message
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
