import prisma from '@/src/utils/db';
import { renderAlertEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { countReviewsForBatch } from './count-reviews';

const SEND_THROTTLE_BATCH = 10;
const SEND_THROTTLE_DELAY_MS = 5000;

const sleep = (ms: number) =>
	new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Worker handler: assemble + send the alert email for one form to every
 * eligible recipient, then advance the form's `last_alert_sent_at` cursor.
 *
 * Eligibility (all must be true):
 *   - User has `alerts_enabled = true`
 *   - User has an enabled `FormAlertSubscription` row for this form
 *   - User still has access to the form's product (AccessRight.status != removed
 *     OR AdminEntityRight on the parent entity OR site-wide admin role)
 *
 * Skips silently if: form is missing/deleted, no reviews since cursor, no
 * eligible recipients.
 */
export async function processFormAlertBatch(formId: number): Promise<void> {
	const form = await prisma.form.findUnique({
		where: { id: formId },
		include: {
			product: {
				include: {
					entity: true
				}
			}
		}
	});

	if (!form || form.isDeleted) {
		console.log(`[alerts] Skipping form ${formId} (missing or deleted)`);
		return;
	}

	const cursor = form.last_alert_sent_at ?? form.created_at;
	const sentAt = new Date();

	const { total, withComments } = await countReviewsForBatch(
		prisma,
		formId,
		cursor,
		sentAt
	);

	if (total === 0) {
		console.log(
			`[alerts] No reviews for form ${formId} since ${cursor.toISOString()}`
		);
		return;
	}

	// Resolve recipients: enabled subscription + global alerts_enabled + access
	const subscriptions = await prisma.formAlertSubscription.findMany({
		where: {
			form_id: formId,
			enabled: true,
			user: { alerts_enabled: true }
		},
		include: {
			user: {
				include: {
					accessRights: true,
					adminEntityRights: { select: { entity_id: true } }
				}
			}
		}
	});

	const productId = form.product_id;
	const entityId = form.product.entity_id;

	const recipients = subscriptions
		.map(s => s.user)
		.filter(user => {
			if (user.role.includes('admin')) return true;
			const hasProductAccess = user.accessRights.some(
				ar => ar.product_id === productId && ar.status !== 'removed'
			);
			const hasEntityAdmin = user.adminEntityRights.some(
				aer => aer.entity_id === entityId
			);
			return hasProductAccess || hasEntityAdmin;
		});

	if (recipients.length === 0) {
		console.log(`[alerts] No eligible recipients for form ${formId}`);
		// Advance the cursor anyway so we don't keep replaying the same window
		// every time a new review arrives.
		await prisma.form.update({
			where: { id: formId },
			data: { last_alert_sent_at: sentAt }
		});
		return;
	}

	const baseUrl = process.env.NODEMAILER_BASEURL ?? '';
	const reviewsUrl = `${baseUrl}/administration/dashboard/product/${productId}/forms/${formId}?tab=reviews`;
	const productTitle = form.product.title;
	const formTitle = form.title || '';
	const subject = `Nouveaux avis sur le formulaire ${formTitle} du service ${productTitle}`;

	for (let i = 0; i < recipients.length; i++) {
		const recipient = recipients[i];
		try {
			const html = await renderAlertEmail({
				userId: recipient.id,
				productTitle,
				formTitle,
				totalNbReviews: total,
				nbReviewsWithComments: withComments,
				reviewsUrl,
				baseUrl
			});

			const text =
				`Vous avez reçu ${total} ${
					total === 1 ? 'nouvelle réponse' : 'nouvelles réponses'
				} ` +
				`sur le formulaire « ${formTitle} » du service « ${productTitle} »` +
				(withComments > 0
					? `, dont ${withComments} avec ${
							withComments === 1 ? 'commentaire' : 'commentaires'
					  }.`
					: '.') +
				`\n\nVoir les nouvelles réponses : ${reviewsUrl}`;

			await sendMail(subject, recipient.email, html, text);

			await prisma.userEvent.create({
				data: {
					user_id: recipient.id,
					action: 'form_alert_sent',
					form_id: formId,
					product_id: productId,
					metadata: {
						total,
						withComments,
						batch_start: cursor.toISOString(),
						batch_end: sentAt.toISOString()
					}
				}
			});
		} catch (err) {
			console.error(
				`[alerts] Failed to deliver alert to ${recipient.email} for form ${formId}:`,
				err
			);
		}

		if ((i + 1) % SEND_THROTTLE_BATCH === 0 && i + 1 < recipients.length) {
			await sleep(SEND_THROTTLE_DELAY_MS);
		}
	}

	await prisma.form.update({
		where: { id: formId },
		data: { last_alert_sent_at: sentAt }
	});

	console.log(
		`[alerts] Sent form ${formId} alert to ${recipients.length} recipient(s) (total=${total}, withComments=${withComments})`
	);
}
