import type { PrismaClient } from '@prisma/client';
import { renderLinkIssueEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { buildLinkIssues, getLinkIssuesMailText } from '@/src/utils/tools';

const MAIL_BATCH_SIZE = 10;
const MAIL_BATCH_PAUSE_MS = 5000;

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

	const productLinkIssues = buildLinkIssues(
		invalidLinkCounts,
		invalidLinkForms,
		closedLinks
	);

	let sentCount = 0;

	for (const productLinkIssue of productLinkIssues) {
		const productId = productLinkIssue.product.id;

		const recipients = await prisma.user.findMany({
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
		});
		if (!recipients.length) continue;

		const html = await renderLinkIssueEmail({
			...productLinkIssue,
			baseUrl: process.env.NODEMAILER_BASEURL
		});
		const subject = `Avis déposés sur un lien d'intégration fermé ou invalide du service numérique «${productLinkIssue.product.title}»`;
		const text = getLinkIssuesMailText(productLinkIssue);

		for (const { email } of recipients) {
			await sendMail(subject, email, html, text);

			sentCount++;
			if (sentCount % MAIL_BATCH_SIZE === 0)
				await new Promise(resolve => setTimeout(resolve, MAIL_BATCH_PAUSE_MS));
		}
	}
}
