import type { Context } from '@/src/server/trpc';
import { renderClosedButtonOrFormEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { shouldSendEmailsAboutDeletion } from '@/src/utils/tools';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const deleteButtonInputSchema = z.object({
	buttonPayload: z.object({
		id: z.number(),
		delete_reason: z.string().nullish()
	}),
	shouldLogEvent: z.boolean().optional(),
	// Produit attendu par l'appelant, comparé au produit réel du bouton.
	product_id: z.number(),
	title: z.string()
});

export const deleteButtonMutation = async ({
	ctx,
	input: initialInput
}: {
	ctx: Context;
	input: z.infer<typeof deleteButtonInputSchema>;
}) => {
	const { buttonPayload, product_id } = initialInput;

	const currentButton = await ctx.prisma.button.findUnique({
		where: { id: buttonPayload.id },
		select: { isDeleted: true, form_id: true }
	});

	if (!currentButton) {
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Button not found' });
	}

	const { product } = await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		form_id: currentButton.form_id
	});

	if (product_id !== product.id) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Button does not belong to this product'
		});
	}

	const deletedButton = await ctx.prisma.button.update({
		where: {
			id: buttonPayload.id
		},
		data: {
			isDeleted: true,
			deleted_at: new Date(),
			delete_reason: buttonPayload.delete_reason
		},
		include: {
			form: { include: { form_template: true } },
			form_template_button: {
				include: {
					variants: true
				}
			}
		}
	});

	if (
		shouldSendEmailsAboutDeletion(
			currentButton.isDeleted,
			deletedButton.isDeleted,
			deletedButton.form.isDeleted
		)
	) {
		const accessRights = await ctx.prisma.accessRight.findMany({
			where: {
				product_id: deletedButton.form.product_id
			}
		});

		const adminEntityRights = await ctx.prisma.adminEntityRight.findMany({
			where: {
				entity_id: product.entity_id
			}
		});

		const emails = [
			...accessRights.map(ar => ar.user_email),
			...adminEntityRights.map(aer => aer.user_email)
		].filter(email => email !== null) as string[];

		for (const email of emails) {
			const emailHtml = await renderClosedButtonOrFormEmail({
				userName: ctx.session!.user.name || "Quelqu'un",
				buttonTitle: deletedButton.title,
				form: {
					id: deletedButton.form.id,
					title:
						deletedButton.form.title ?? deletedButton.form.form_template.title
				},
				product: {
					id: product.id,
					title: product.title,
					entityName: product.entity.name
				},
				baseUrl: process.env.NODEMAILER_BASEURL
			});

			await sendMail(
				`Fermeture du lien d'intégration «${deletedButton.title}» du service numérique «${product.title}»`,
				email,
				emailHtml,
				`Fermeture du lien d'intégration «${deletedButton.title}» du service numérique «${product.title}»`
			);
		}
	}

	return { data: deletedButton };
};
