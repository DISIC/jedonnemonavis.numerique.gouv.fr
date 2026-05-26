import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';

export type ProductSubscriptionGroup = {
	product: {
		id: number;
		title: string;
		entity: { id: number; name: string; acronym: string };
	};
	forms: Array<{ id: number; title: string; enabled: boolean }>;
};

export const getMySubscriptionsQuery = async ({ ctx }: { ctx: Context }) => {
	const contextUser = ctx.session!.user;
	const userId = parseInt(contextUser.id);
	const isAdmin = contextUser.role.includes('admin');

	const whereUserScope: Prisma.ProductWhereInput = {
		OR: [
			{
				accessRights: !isAdmin
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
					adminEntityRights: !isAdmin
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

	const products = await ctx.prisma.product.findMany({
		where: {
			...whereUserScope,
			status: 'published'
		},
		select: {
			id: true,
			title: true,
			entity: { select: { id: true, name: true, acronym: true } },
			forms: {
				where: { isDeleted: false },
				select: {
					id: true,
					title: true,
					form_alert_subscriptions: {
						where: { user_id: userId },
						select: { enabled: true }
					}
				}
			}
		}
	});

	const data: ProductSubscriptionGroup[] = products
		.map(product => ({
			product: {
				id: product.id,
				title: product.title,
				entity: product.entity
			},
			forms: product.forms
				.map(form => ({
					id: form.id,
					title: form.title ?? 'Formulaire sans titre',
					enabled: form.form_alert_subscriptions[0]?.enabled ?? false
				}))
				.sort((a, b) => a.title.localeCompare(b.title))
		}))
		.sort((a, b) => a.product.title.localeCompare(b.product.title));

	return { data };
};
