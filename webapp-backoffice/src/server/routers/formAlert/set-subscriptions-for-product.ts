import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const setSubscriptionsForProductInputSchema = z.object({
	product_id: z.number(),
	enabled: z.boolean()
});

export const setSubscriptionsForProductMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof setSubscriptionsForProductInputSchema>;
}) => {
	const userId = parseInt(ctx.session!.user.id);
	const { product_id, enabled } = input;

	const forms = await ctx.prisma.form.findMany({
		where: { product_id, isDeleted: false },
		select: { id: true }
	});
	const formIds = forms.map(f => f.id);

	if (formIds.length === 0) {
		return { data: { updated: 0 } };
	}

	const updated = await ctx.prisma.$transaction(async tx => {
		if (enabled) {
			await tx.form.updateMany({
				where: {
					id: { in: formIds },
					form_alert_subscriptions: {
						none: { enabled: true, NOT: { user_id: userId } }
					}
				},
				data: { last_alert_sent_at: new Date() }
			});
		}

		await tx.formAlertSubscription.createMany({
			data: formIds.map(form_id => ({ user_id: userId, form_id, enabled })),
			skipDuplicates: true
		});
		const updatedResult = await tx.formAlertSubscription.updateMany({
			where: { user_id: userId, form_id: { in: formIds } },
			data: { enabled }
		});

		return updatedResult;
	});

	return { data: { updated: updated.count } };
};
