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

	for (const { product, forms: productForms } of digests) {
		const [accessRights, adminEntityRights] = await Promise.all([
			prisma.accessRight.findMany({
				where: { product_id: product.id, status: { not: 'removed' } },
				select: { user_email: true }
			}),
			prisma.adminEntityRight.findMany({
				where: { entity: { products: { some: { id: product.id } } } },
				select: { user_email: true }
			})
		]);

		const emails = new Set(
			[...accessRights, ...adminEntityRights]
				.map(right => right.user_email)
				.filter((email): email is string => !!email)
		);

		if (!emails.size) continue;

		const html = await renderInvalidButtonsEmail({
			product,
			forms: productForms,
			startDate,
			endDate,
			baseUrl: process.env.NODEMAILER_BASEURL
		});
		const subject = `Des avis ont été déposés sur des liens d'intégration inexistants du service numérique «${product.title}»`;

		for (const email of emails) {
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
		}
	}
}
