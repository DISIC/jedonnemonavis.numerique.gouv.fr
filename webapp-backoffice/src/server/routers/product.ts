import { z } from 'zod';
import {
	router,
	publicProcedure,
	protectedProcedure,
	protectedApiProcedure
} from '@/src/server/trpc';
import {
	ProductUncheckedCreateInputSchema,
	ProductUncheckedUpdateInputSchema
} from '@/prisma/generated/zod';
import { TRPCError } from '@trpc/server';
import { Prisma, PrismaClient, Product } from '@prisma/client';
import { removeAccents } from '@/src/utils/tools';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Session } from 'next-auth';
import { sendMail } from '@/src/utils/mailer';
import {
	getProductArchivedEmail,
	getProductRestoredEmail
} from '@/src/utils/emails';

const checkRightToProceed = async (
	prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
	session: Session,
	product_id: number
) => {
	const product = await prisma.product.findUnique({
		where: {
			id: product_id
		}
	});
	const accessRight = await prisma.accessRight.findFirst({
		where: {
			product_id: product_id,
			user_email: session.user.email,
			status: 'carrier_admin'
		}
	});
	const adminEntityRight = await prisma.adminEntityRight.findFirst({
		where: {
			entity_id: product?.entity_id,
			user_email: session.user.email
		}
	});
	const isAdmin = session.user.role.includes('admin');

	if (!accessRight && !adminEntityRight && !isAdmin)
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You do not have rights to proceed on this product'
		});

	return !!accessRight || isAdmin;
};

export const productRouter = router({
	getById: publicProcedure
		.meta({ logEvent: true })
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const product = await ctx.prisma.product.findUnique({
				where: {
					id: input.id
				}
			});

			if (!product)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found'
				});

			return { data: product };
		}),

	getList: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				sort: z.string().optional(),
				search: z.string().optional(),
				filterEntityId: z.array(z.number()),
				filterByUserFavorites: z.boolean().optional(),
				filterByStatusArchived: z.boolean().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const contextUser = ctx.session.user;
			const {
				numberPerPage,
				page,
				sort,
				search,
				filterEntityId,
				filterByUserFavorites,
				filterByStatusArchived
			} = input;

			let orderBy: Prisma.ProductOrderByWithAggregationInput[] = [
				{
					title: 'asc'
				}
			];

			const whereUserScope: Prisma.ProductWhereInput = {
				OR: [
					{
						accessRights: !contextUser.role.includes('admin')
							? {
									some: {
										user_email: contextUser.email,
										status: { in: ['carrier_admin', 'carrier_user'] }
									}
								}
							: {}
					},
					{
						entity: {
							adminEntityRights: !contextUser.role.includes('admin')
								? {
										some: {
											user_email: contextUser.email
										}
									}
								: {}
						}
					}
				]
			};

			let where: Prisma.ProductWhereInput = {
				...whereUserScope,
				status: filterByStatusArchived ? 'archived' : 'published'
			};

			if (search) {
				let searchWithoutAccents = removeAccents(search);
				const searchQuery = searchWithoutAccents
					.split(' ')
					.map(word => `${word}:*`)
					.join('&');

				where = {
					AND: [
						{ ...where },
						{
							OR: [
								{
									title_formatted: {
										search: searchQuery
									}
								},
								{
									title: {
										search: searchQuery
									}
								}
							]
						}
					]
				};
			}

			if (filterEntityId.length > 0) {
				where.entity = {
					id: {
						in: filterEntityId
					}
				};
			}

			if (filterByUserFavorites) {
				where.favorites = {
					some: {
						user_id: parseInt(contextUser.id)
					}
				};
			}

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

			try {
				const products = await ctx.prisma.product.findMany({
					orderBy,
					where,
					take: numberPerPage,
					skip: numberPerPage * (page - 1),
					include: {
						forms: {
							include: {
								buttons: true,
								form_template: true,
								form_configs: {
									include: {
										form_config_displays: true,
										form_config_labels: true
									}
								}
							}
						}
					}
				});

				const allProducts = await ctx.prisma.product.findMany({
					orderBy,
					where
				});

				const count = await ctx.prisma.product.count({ where });

				const countTotalUserScope = await ctx.prisma.product.count({
					where: whereUserScope
				});

				const countArchivedUserScope = await ctx.prisma.product.count({
					where: { ...whereUserScope, status: 'archived' }
				});

				return {
					data: products,
					metadata: { count, countTotalUserScope, countArchivedUserScope }
				};
			} catch (e) {
				console.log(e);
				return {
					data: [],
					metadata: {
						count: 0,
						countTotalUserScope: 0,
						countArchivedUserScope: 0,
						countNewReviews: 0
					}
				};
			}
		}),

	getXWikiIds: publicProcedure
		.meta({ openapi: { method: 'GET', path: '/products/xwiki' } })
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1)
			})
		)
		.output(
			z.object({
				data: z.array(
					z.object({
						id: z.number(),
						xwiki_id: z.number().nullable(),
						title: z.string(),
						buttons: z.array(
							z.object({
								id: z.number(),
								title: z.string(),
								xwiki_title: z.string().nullable()
							})
						)
					})
				),
				metadata: z.object({ count: z.number() })
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page } = input;

			const products = await ctx.prisma.product.findMany({
				take: numberPerPage,
				skip: numberPerPage * (page - 1),
				include: {
					forms: {
						include: {
							buttons: true
						}
					}
				}
			});

			const count = await ctx.prisma.product.count();

			return {
				data: products.map(product => ({
					id: product.id,
					xwiki_id: product.xwiki_id,
					title: product.title,
					buttons: product.forms[0].buttons.map(b => ({
						id: b.id,
						title: b.title,
						xwiki_title: b.xwiki_title
					}))
				})),
				metadata: { count }
			};
		}),

	create: protectedProcedure
		.meta({ logEvent: true })
		.input(ProductUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input: productPayload }) => {
			const userEmail = ctx.session?.user?.email;

			productPayload.title_formatted = removeAccents(productPayload.title);

			const rootTemplate = await ctx.prisma.formTemplate.findUnique({
				where: { slug: 'root' },
				select: { id: true }
			});
	
			if (!rootTemplate) {
				throw new Error('Le FormTemplate "root" est introuvable.');
			}

			const product = await ctx.prisma.product.create({
				data: {
					...productPayload,
					accessRights: {
						create: [
							{
								user_email: userEmail,
								status: 'carrier_admin'
							}
						]
					}
				}
			});
			
			await ctx.prisma.form.create({
				data: {
					form_template_id: rootTemplate.id,
					product_id: product.id // ou { connect: { id: product.id } }
				}
			});

			return { data: product };
		}),

	update: protectedProcedure
		.meta({ logEvent: true })
		.input(
			z.object({ id: z.number(), product: ProductUncheckedUpdateInputSchema })
		)
		.mutation(async ({ ctx, input }) => {
			const { id, product } = input;

			await checkRightToProceed(ctx.prisma, ctx.session, id);

			product.title_formatted = removeAccents(product.title as string);

			const updatedProduct = await ctx.prisma.product.update({
				where: { id },
				data: {
					...product
				}
			});

			return { data: updatedProduct };
		}),

	archive: protectedProcedure
		.meta({ logEvent: true })
		.input(z.object({ product_id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { product_id } = input;

			await checkRightToProceed(ctx.prisma, ctx.session, product_id);

			const updatedProduct = await ctx.prisma.product.update({
				where: { id: product_id },
				data: {
					status: 'archived'
				}
			});

			const accessRights = await ctx.prisma.accessRight.findMany({
				where: {
					product_id: updatedProduct.id
				}
			});

			const adminEntityRights = await ctx.prisma.adminEntityRight.findMany({
				where: {
					entity_id: updatedProduct.entity_id
				}
			});

			const emails = [
				...accessRights.map(ar => ar.user_email),
				...adminEntityRights.map(aer => aer.user_email)
			].filter(email => email !== null) as string[];

			emails.forEach((email: string) => {
				sendMail(
					`Suppression du service « ${updatedProduct.title} » sur la plateforme « Je donne mon avis »`,
					email,
					getProductArchivedEmail(ctx.session.user, updatedProduct.title),
					`Le produit numérique "${updatedProduct.title}" a été supprimé.`
				);
			});

			return { data: updatedProduct };
		}),

	restore: protectedProcedure
		.meta({ logEvent: true })
		.input(z.object({ product_id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const { product_id } = input;

			await checkRightToProceed(ctx.prisma, ctx.session, product_id);

			const updatedProduct = await ctx.prisma.product.update({
				where: { id: product_id },
				data: {
					status: 'published'
				}
			});
			const accessRights = await ctx.prisma.accessRight.findMany({
				where: {
					product_id: updatedProduct.id
				}
			});

			const adminEntityRights = await ctx.prisma.adminEntityRight.findMany({
				where: {
					entity_id: updatedProduct.entity_id
				}
			});

			const emails = [
				...accessRights.map(ar => ar.user_email),
				...adminEntityRights.map(aer => aer.user_email)
			].filter(email => email !== null) as string[];

			emails.forEach((email: string) => {
				sendMail(
					`Restauration du service « ${updatedProduct.title} » sur la plateforme « Je donne mon avis »`,
					email,
					getProductRestoredEmail(
						ctx.session.user,
						updatedProduct.title,
						updatedProduct.id
					),
					`Le produit numérique "${updatedProduct.title}" a été restauré.`
				);
			});

			return { data: updatedProduct };
		})
});
