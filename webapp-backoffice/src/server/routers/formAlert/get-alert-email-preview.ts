import type { Context } from '@/src/server/trpc';
import { renderAlertEmail } from '@/src/utils/emails';
import { z } from 'zod';

export const getAlertEmailPreviewInputSchema = z.object({
	productTitle: z.string().trim().max(255).optional(),
	formTitle: z.string().trim().max(255).optional()
});

export const getAlertEmailPreviewQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getAlertEmailPreviewInputSchema>;
}) => {
	const baseUrl = process.env.NODEMAILER_BASEURL ?? '';
	const html = await renderAlertEmail({
		userId: ctx.session?.user?.id ? parseInt(ctx.session.user.id) : undefined,
		productTitle:
			input.productTitle ||
			'1000J BLUES - AUTO DEPISTAGE DE LA DEPRESSION POST PARTUM',
		formTitle: input.formTitle || "Remontée d'information",
		totalNbReviews: 3,
		nbReviewsWithComments: 2,
		reviewsUrl: `${baseUrl}/administration/dashboard/product/1/forms/1?tab=reviews`,
		baseUrl
	});

	return { data: { html } };
};
