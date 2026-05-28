import type { Context } from '@/src/server/trpc';
import { z } from 'zod';

export const getSubscriptionInputSchema = z.object({
	form_id: z.number()
});

export const getSubscriptionQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getSubscriptionInputSchema>;
}) => {
	const userId = ctx.session!.user.id;
	const subscription = await ctx.prisma.formAlertSubscription.findUnique({
		where: {
			user_id_form_id: {
				user_id: parseInt(userId),
				form_id: input.form_id
			}
		},
		select: { enabled: true }
	});

	return { data: { enabled: subscription?.enabled ?? false } };
};
