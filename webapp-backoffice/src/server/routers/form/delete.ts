import type { Context } from '@/src/server/trpc';
import { renderClosedButtonOrFormEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { shouldSendEmailsAboutDeletion } from '@/src/utils/tools';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const deleteFormInputSchema = z.object({
	id: z.number(),
	// Produit attendu par l'appelant, comparé au produit réel du formulaire.
	product_id: z.number(),
	form: z.object({
		delete_reason: z.string().nullish()
	})
});

export const deleteFormMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteFormInputSchema>;
}) => {
	const { id, form, product_id } = input;

	const currentForm = await ctx.prisma.form.findUnique({
		where: { id },
		select: { isDeleted: true, product_id: true }
	});

	if (!currentForm) {
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' });
	}

	const { product } = await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		form_id: id
	});

	if (product_id !== currentForm.product_id) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Form does not belong to this product'
		});
	}

	const deletedForm = await ctx.prisma.form.update({
		where: { id },
		data: {
			isDeleted: true,
			deleted_at: new Date(),
			delete_reason: form.delete_reason ?? null
		},
		include: { form_template: true }
	});

	if (
		shouldSendEmailsAboutDeletion(currentForm.isDeleted, deletedForm.isDeleted)
	) {
		const accessRights = await ctx.prisma.accessRight.findMany({
			where: {
				product_id: deletedForm.product_id
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
				formTitle: deletedForm.title ?? deletedForm.form_template.title,
				form: {
					id: deletedForm.id,
					title: deletedForm.title ?? deletedForm.form_template.title
				},
				product: {
					id: product.id,
					title: product.title,
					entityName: product.entity.name
				},
				baseUrl: process.env.NODEMAILER_BASEURL
			});

			await sendMail(
				`Fermeture du formulaire «${
					deletedForm.title ?? deletedForm.form_template.title
				}» du service numérique «${product.title}»`,
				email,
				emailHtml,
				`Fermeture du formulaire «${
					deletedForm.title || deletedForm.form_template.title
				}» du service numérique «${product.title}»`
			);
		}
	}

	return { data: deletedForm };
};
