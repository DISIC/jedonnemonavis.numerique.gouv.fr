import type { Context } from '@/src/server/trpc';

export type ProductSubscriptionGroup = {
	product: {
		id: number;
		title: string;
		entity: { id: number; name: string; acronym: string };
	};
	forms: Array<{ id: number; title: string; enabled: boolean }>;
};

export const getMySubscriptionsQuery = async ({ ctx }: { ctx: Context }) => {
	const userId = parseInt(ctx.session!.user.id);

	const subscriptions = await ctx.prisma.formAlertSubscription.findMany({
		where: {
			user_id: userId,
			form: { isDeleted: false }
		},
		include: {
			form: {
				select: {
					id: true,
					title: true,
					product: {
						select: {
							id: true,
							title: true,
							entity: { select: { id: true, name: true, acronym: true } }
						}
					}
				}
			}
		}
	});

	const groups = new Map<number, ProductSubscriptionGroup>();
	for (const sub of subscriptions) {
		const product = sub.form.product;
		let group = groups.get(product.id);
		if (!group) {
			group = {
				product: {
					id: product.id,
					title: product.title,
					entity: product.entity
				},
				forms: []
			};
			groups.set(product.id, group);
		}
		group.forms.push({
			id: sub.form.id,
			title: sub.form.title ?? 'Formulaire sans titre',
			enabled: sub.enabled
		});
	}

	const data = Array.from(groups.values())
		.map(group => ({
			...group,
			forms: group.forms.sort((a, b) => a.title.localeCompare(b.title))
		}))
		.sort((a, b) => a.product.title.localeCompare(b.product.title));

	return { data };
};
