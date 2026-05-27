import { Prisma } from '@prisma/client';

export type ProductSubscriptionGroup = {
	product: {
		id: number;
		title: string;
		entity: { id: number; name: string; acronym: string };
	};
	forms: Array<{ id: number; title: string; enabled: boolean }>;
};

export const buildAccessibleProductsWhere = (user: {
	email?: string | null;
	role: string;
}): Prisma.ProductWhereInput => {
	const isAdmin = user.role.includes('admin');
	return {
		status: 'published',
		OR: [
			{
				accessRights: !isAdmin
					? {
							some: {
								user_email: user.email,
								status: { in: ['carrier_admin', 'carrier_user'] }
							}
					  }
					: {}
			},
			{
				entity: {
					adminEntityRights: !isAdmin
						? { some: { user_email: user.email } }
						: {}
				}
			}
		]
	};
};

export const hasActiveSubscriptionForms = (
	userId: number
): Prisma.ProductWhereInput['forms'] => ({
	some: {
		isDeleted: false,
		form_alert_subscriptions: { some: { user_id: userId, enabled: true } }
	}
});

export const productSubscriptionSelect = (userId: number) =>
	({
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
	}) satisfies Prisma.ProductSelect;

type RawProduct = {
	id: number;
	title: string;
	entity: { id: number; name: string; acronym: string };
	forms: {
		id: number;
		title: string | null;
		form_alert_subscriptions: { enabled: boolean }[];
	}[];
};

export const mapProductsToGroups = (
	products: RawProduct[]
): ProductSubscriptionGroup[] =>
	products
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
