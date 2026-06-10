import type { Context } from '@/src/server/trpc';
import { buildOrderBy } from '@/src/server/utils/order-by';
import {
	alternativeString,
	buildSearchQuery,
	normalizeString
} from '@/src/utils/tools';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const PRODUCT_SORT_FIELDS = [
	'title',
	'created_at',
	'updated_at',
	'entity.name'
] as const;

export const getProductListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	sort: z.string().optional(),
	search: z.string().optional(),
	filterEntityId: z.array(z.number()),
	filterByUserFavorites: z.boolean().optional(),
	filterByStatusArchived: z.boolean().optional()
});

export const getProductListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getProductListInputSchema>;
}) => {
	const contextUser = ctx.session!.user;
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
		const searchWithoutAccents = normalizeString(search);
		const alternativeSearchText = alternativeString(searchWithoutAccents);

		const queries = new Set<string>([buildSearchQuery(searchWithoutAccents)]);
		if (
			alternativeSearchText &&
			alternativeSearchText !== searchWithoutAccents
		) {
			queries.add(buildSearchQuery(alternativeSearchText));
		}

		const orConditions = Array.from(queries).flatMap(q => [
			{ title_formatted: { search: q } },
			{ title: { search: q } }
		]);

		where = {
			AND: [{ ...where }, { OR: orConditions }]
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

	const safeOrderBy = buildOrderBy(sort, PRODUCT_SORT_FIELDS);
	if (safeOrderBy) {
		orderBy = [safeOrderBy as Prisma.ProductOrderByWithAggregationInput];
	}

	const include = {
		forms: {
			include: {
				buttons: { include: { closedButtonLog: true } },
				form_template: true,
				form_configs: {
					include: {
						form_config_displays: true,
						form_config_labels: true
					}
				}
			}
		}
	} satisfies Prisma.ProductInclude;

	const skip = numberPerPage * (page - 1);
	const favoritesFirst = !filterByUserFavorites && !filterByStatusArchived;

	try {
		let products: Prisma.ProductGetPayload<{ include: typeof include }>[];

		if (favoritesFirst) {
			const favoriteWhere: Prisma.ProductWhereInput = {
				...where,
				favorites: { some: { user_id: parseInt(contextUser.id) } }
			};
			const favoritesCount = await ctx.prisma.product.count({
				where: favoriteWhere
			});

			if (skip < favoritesCount) {
				const favorites = await ctx.prisma.product.findMany({
					orderBy,
					where: favoriteWhere,
					take: numberPerPage,
					skip,
					include
				});

				const remaining = numberPerPage - favorites.length;
				const nonFavorites =
					remaining > 0
						? await ctx.prisma.product.findMany({
								orderBy,
								where: {
									...where,
									NOT: {
										favorites: { some: { user_id: parseInt(contextUser.id) } }
									}
								},
								take: remaining,
								skip: 0,
								include
						  })
						: [];

				products = [...favorites, ...nonFavorites];
			} else {
				products = await ctx.prisma.product.findMany({
					orderBy,
					where: {
						...where,
						NOT: {
							favorites: { some: { user_id: parseInt(contextUser.id) } }
						}
					},
					take: numberPerPage,
					skip: skip - favoritesCount,
					include
				});
			}
		} else {
			products = await ctx.prisma.product.findMany({
				orderBy,
				where,
				take: numberPerPage,
				skip,
				include
			});
		}

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
};
