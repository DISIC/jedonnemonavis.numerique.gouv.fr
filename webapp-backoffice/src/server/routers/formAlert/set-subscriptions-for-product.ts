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

	const result = await ctx.prisma.formAlertSubscription.updateMany({
		where: {
			user_id: userId,
			form_id: { in: formIds }
		},
		data: { enabled }
	});

	return { data: { updated: result.count } };
};
