import type { PrismaClient } from '@prisma/client';
import { renderLinkIssueEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { buildLinkIssues } from '@/src/utils/tools';

const linkIssueFormSelect = {
	id: true,
	title: true,
	form_template: { select: { title: true } },
	product: { select: { id: true, title: true } }
} as const;

export async function sendLinkIssuesDigest(
	prisma: PrismaClient,
	startDate: Date,
	endDate: Date
): Promise<void> {
	const period = { gte: startDate, lte: endDate };
	const activeProduct = { status: { not: 'archived' as const } };

	const invalidLinkCounts = await prisma.review.groupBy({
		by: ['form_id', 'requested_button_id'],
		where: { button_id: null, has_verbatim: true, created_at: period },
		_count: { _all: true }
	});

	const invalidLinkForms = await prisma.form.findMany({
		where: {
			id: { in: [...new Set(invalidLinkCounts.map(ilc => ilc.form_id))] },
			NOT: { isDeleted: true },
			product: activeProduct
		},
		select: linkIssueFormSelect
	});

	const closedLinks = await prisma.button.findMany({
		where: {
			closedButtonLog: { updated_at: period },
			form: { product: activeProduct }
		},
		select: { title: true, form: { select: linkIssueFormSelect } }
	});

	const linkIssues = buildLinkIssues(
		invalidLinkCounts,
		invalidLinkForms,
		closedLinks
	);

	const recipientsByProductId = new Map<number, { email: string }[]>();

	for (const linkIssue of linkIssues) {
		const productId = linkIssue.product.id;

		if (!recipientsByProductId.has(productId)) {
			recipientsByProductId.set(
				productId,
				await prisma.user.findMany({
					where: {
						notifications: true,
						OR: [
							{
								accessRights: {
									some: { product_id: productId, status: { not: 'removed' } }
								}
							},
							{
								adminEntityRights: {
									some: { entity: { products: { some: { id: productId } } } }
								}
							}
						]
					},
					select: { email: true }
				})
			);
		}

		const recipients = recipientsByProductId.get(productId) ?? [];
		if (!recipients.length) continue;

		const html = await renderLinkIssueEmail({
			...linkIssue,
			baseUrl: process.env.NODEMAILER_BASEURL
		});
		const subject = `Avis déposés sur un lien d'intégration fermé ou invalide du service numérique «${linkIssue.product.title}»`;

		for (const { email } of recipients) {
			await sendMail(
				subject,
				email,
				html,
				`Des utilisateurs ont déposé, ou tenté de déposer, un avis sur le lien d'intégration «${linkIssue.linkLabel}» du formulaire «${linkIssue.form.title}». Supprimez ou modifiez le code de ce lien sur votre site.`
			);
		}
	}
}
