import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	startOfDay,
	endOfDay,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	isMonday,
	subWeeks,
	subDays,
	subMonths
} from 'date-fns';
import { getProductsWithReviewCountsByScope } from '@/src/utils/notifs';
import { sendMail } from '@/src/utils/mailer';
import type { Context } from '@/src/server/trpc';
import { renderNotificationsEmail } from '@/src/utils/emails';

export const triggerSendNotifMailsMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: { date: Date };
}) => {
	const { date } = input;

	if (!ctx.api_key?.scope.includes('admin')) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You need to be admin to perform this action'
		});
	}

	const scopes: {
		scope: 'daily' | 'weekly' | 'monthly';
		startDate: Date;
		endDate: Date;
	}[] = [];

	// Initiate Daily
	const dailyStartDate = startOfDay(subDays(date, 1));
	const dailyEndDate = endOfDay(subDays(date, 1));
	scopes.push({
		scope: 'daily',
		startDate: dailyStartDate,
		endDate: dailyEndDate
	});

	// Initiate Weekly
	if (isMonday(date)) {
		const weeklyStartDate = startOfWeek(subWeeks(date, 1), {
			weekStartsOn: 1
		});
		const weeklyEndDate = endOfWeek(subWeeks(date, 1), { weekStartsOn: 1 });
		scopes.push({
			scope: 'weekly',
			startDate: weeklyStartDate,
			endDate: weeklyEndDate
		});
	}

	// Initiate Monthly
	if (isMonday(date) && date.getDate() <= 7) {
		const monthlyStartDate = startOfMonth(subMonths(date, 1));
		const monthlyEndDate = endOfMonth(subMonths(date, 1));
		scopes.push({
			scope: 'monthly',
			startDate: monthlyStartDate,
			endDate: monthlyEndDate
		});
	}

	// Count new reviews and group by form
	const results: {
		scope: 'daily' | 'weekly' | 'monthly';
		startDate: Date;
		endDate: Date;
		forms: {
			formId: number;
			formTitle: string;
			reviewCount: number;
			productId: number;
			productTitle: string;
			entityName: string;
		}[];
		users?: {
			userEmail: string;
			userId: number;
			accessibleProducts: {
				productId: number;
				productTitle: string;
				forms: {
					formId: number;
					formTitle: string;
					reviewCount: number;
				}[];
			}[];
		}[];
	}[] = await getProductsWithReviewCountsByScope(ctx.prisma, scopes);

	// Add user filtering and form matching for each scope
	for (const scopeResult of results) {
		const { scope, forms, startDate, endDate } = scopeResult;

		// Fetch users for the current scope
		const users = await ctx.prisma.user.findMany({
			where: {
				notifications: true,
				notifications_frequency: scope
			},
			include: {
				accessRights: true,
				adminEntityRights: {
					include: {
						entity: {
							include: {
								products: true
							}
						}
					}
				}
			}
		});

		// Associate users with accessible products and send mails
		const userProductAssociations = [];

		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			const accessibleProductIds = [
				...user.accessRights
					.filter(ar => ar.status !== 'removed')
					.map(ar => ar.product_id),
				...user.adminEntityRights.flatMap(aer =>
					aer.entity.products.map(p => p.id)
				)
			];

			// Filter forms by accessible products
			const accessibleForms = user.role.includes('admin')
				? forms
				: forms.filter(form => accessibleProductIds.includes(form.productId));

			// Group forms by product and limit to 10 most active products
			const productGroups = new Map<
				number,
				{
					productId: number;
					productTitle: string;
					entityName: string;
					forms: {
						formId: number;
						formTitle: string;
						reviewCount: number;
					}[];
					totalReviews: number;
				}
			>();

			accessibleForms.forEach(form => {
				const productId = form.productId;
				if (productGroups.has(productId)) {
					const group = productGroups.get(productId)!;
					group.forms.push({
						formId: form.formId,
						formTitle: form.formTitle,
						reviewCount: form.reviewCount
					});
					group.totalReviews += form.reviewCount;
				} else {
					productGroups.set(productId, {
						productId: form.productId,
						productTitle: form.productTitle,
						entityName: form.entityName,
						forms: [
							{
								formId: form.formId,
								formTitle: form.formTitle,
								reviewCount: form.reviewCount
							}
						],
						totalReviews: form.reviewCount
					});
				}
			});

			// Sort by total reviews and limit to 10 products
			const accessibleProducts = Array.from(productGroups.values())
				.sort((a, b) => b.totalReviews - a.totalReviews)
				.slice(0, 10);

			const totalNewReviews = accessibleProducts.reduce(
				(sum, product) => sum + product.totalReviews,
				0
			);

			if (accessibleProducts.length > 0) {
				const emailHtml = await renderNotificationsEmail({
					userId: user.id,
					frequency: scope,
					totalNbReviews: totalNewReviews,
					startDate,
					endDate,
					products: accessibleProducts.map(product => ({
						title: product.productTitle,
						id: product.productId,
						nbReviews: product.totalReviews,
						entityName: product.entityName,
						forms: product.forms
					})),
					baseUrl: process.env.NODEMAILER_BASEURL
				});

				const displayPlural = totalNewReviews > 1 ? 's' : '';

				sendMail(
					'Nouvelles réponses JDMA',
					user.email,
					emailHtml,
					`Vous avez ${totalNewReviews} nouvelle${displayPlural} réponse${displayPlural} sur vos différents services. Rendez vous sur votre tableau de bord JDMA pour plus de détails.`
				);
			}

			userProductAssociations.push({
				userEmail: user.email,
				userId: user.id,
				accessibleProducts
			});

			if ((i + 1) % 10 === 0) {
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		}

		scopeResult.users = userProductAssociations;
	}

	return {
		result: {
			results,
			message: `Scopes processed and users matched successfully`
		}
	};
};

export const triggerSendNotifMailsInputSchema = z.object({
	date: z.date()
});

export const triggerSendNotifMailsOutputSchema = z.object({
	result: z.object({
		results: z.array(
			z.object({
				scope: z.enum(['daily', 'weekly', 'monthly']),
				startDate: z.date(),
				endDate: z.date(),
				forms: z.array(
					z.object({
						formId: z.number(),
						formTitle: z.string(),
						reviewCount: z.number(),
						productId: z.number(),
						productTitle: z.string()
					})
				),
				users: z
					.array(
						z.object({
							userEmail: z.string(),
							userId: z.number(),
							accessibleProducts: z.array(
								z.object({
									productId: z.number(),
									productTitle: z.string(),
									forms: z.array(
										z.object({
											formId: z.number(),
											formTitle: z.string(),
											reviewCount: z.number()
										})
									)
								})
							)
						})
					)
					.optional()
			})
		),
		message: z.string()
	})
});
