import type { PrismaClient } from '@prisma/client';
import { renderInvalidButtonsEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { groupInvalidButtonReviewsByProduct } from '@/src/utils/tools';

export async function sendInvalidButtonsDigest(
	prisma: PrismaClient,
	startDate: Date,
	endDate: Date
): Promise<void> {
	const reviewCounts = await prisma.review.groupBy({
		by: ['form_id', 'requested_button_id'],
		where: {
			button_id: null,
			created_at: { gte: startDate, lte: endDate }
		},
		_count: { _all: true }
	});

	if (!reviewCounts.length) return;

	const forms = await prisma.form.findMany({
		where: {
			id: { in: [...new Set(reviewCounts.map(rc => rc.form_id))] },
			NOT: { isDeleted: true },
			product: { status: { not: 'archived' } }
		},
		select: {
			id: true,
			title: true,
			form_template: { select: { title: true } },
			product: {
				select: {
					id: true,
					title: true,
					entity: { select: { name: true } }
				}
			}
		}
	});

	const digests = groupInvalidButtonReviewsByProduct(reviewCounts, forms);
	let sentCount = 0;

	for (const { product, forms: productForms } of digests) {
		const recipients = await prisma.user.findMany({
			where: {
				notifications: true,
				OR: [
					{
						accessRights: {
							some: { product_id: product.id, status: { not: 'removed' } }
						}
					},
					{
						adminEntityRights: {
							some: { entity: { products: { some: { id: product.id } } } }
						}
					}
				]
			},
			select: { email: true }
		});

		if (!recipients.length) continue;

		const html = await renderInvalidButtonsEmail({
			product,
			forms: productForms,
			startDate,
			endDate,
			baseUrl: process.env.NODEMAILER_BASEURL
		});
		const subject = `Des avis ont été déposés sur des liens d'intégration inexistants du service numérique «${product.title}»`;

		for (const { email } of recipients) {
			try {
				await sendMail(
					subject,
					email,
					html,
					`${subject}. Pensez à revoir les liens d'intégration de votre site.`
				);
			} catch (err) {
				console.error(
					`[invalid-buttons] Failed to send digest to ${email} for product ${product.id}:`,
					err
				);
			}

			sentCount++;
			if (sentCount % 10 === 0) {
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		}
	}
}
