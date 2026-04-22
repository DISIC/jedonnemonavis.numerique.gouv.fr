import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const setSubscriptionInputSchema = z.object({
	form_id: z.number(),
	enabled: z.boolean()
});

export const setSubscriptionMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof setSubscriptionInputSchema>;
}) => {
	const userId = parseInt(ctx.session!.user.id);
	const { form_id, enabled } = input;

	const subscription = await ctx.prisma.formAlertSubscription.upsert({
		where: { user_id_form_id: { user_id: userId, form_id } },
		create: { user_id: userId, form_id, enabled },
		update: { enabled }
	});

	return { data: { enabled: subscription.enabled } };
};
