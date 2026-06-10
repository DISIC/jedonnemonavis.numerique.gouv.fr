import type { Context } from '@/src/server/trpc';
import { renderNotificationsEmail } from '@/src/utils/emails';
import { z } from 'zod';

export const getNotificationsEmailPreviewInputSchema = z.object({
	frequency: z.enum(['daily', 'weekly', 'monthly']),
	productTitle: z.string().trim().max(255).optional(),
	formTitle: z.string().trim().max(255).optional()
});

export const getNotificationsEmailPreviewQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getNotificationsEmailPreviewInputSchema>;
}) => {
	const baseUrl = process.env.NODEMAILER_BASEURL ?? '';

	const endDate = new Date();
	const startDate = new Date(endDate);
	if (input.frequency === 'weekly') startDate.setDate(startDate.getDate() - 7);
	if (input.frequency === 'monthly')
		startDate.setMonth(startDate.getMonth() - 1);

	const html = await renderNotificationsEmail({
		userId: ctx.session?.user?.id ? parseInt(ctx.session.user.id) : undefined,
		frequency: input.frequency,
		totalNbReviews: 3,
		startDate,
		endDate,
		products: [
			{
				id: 1,
				title:
					input.productTitle ||
					'1000J BLUES - AUTO DEPISTAGE DE LA DEPRESSION POST PARTUM',
				nbReviews: 3,
				forms: [
					{
						formId: 1,
						formTitle: input.formTitle || "Remontée d'information",
						reviewCount: 3
					}
				]
			}
		],
		baseUrl
	});

	return { data: { html } };
};
