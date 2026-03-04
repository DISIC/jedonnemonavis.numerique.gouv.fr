import { FormUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { renderClosedButtonOrFormEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { shouldSendEmailsAboutDeletion } from '@/src/utils/tools';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const deleteFormInputSchema = z.object({
	id: z.number(),
	product_id: z.number(),
	form: FormUncheckedUpdateInputSchema
});

export const deleteFormMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof deleteFormInputSchema>;
}) => {
	const { id, form, product_id } = input;

	const { product } = await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id: product_id
	});

	const currentForm = await ctx.prisma.form.findUnique({
		where: { id: input.id as number },
		select: { isDeleted: true }
	});

	const deletedForm = await ctx.prisma.form.update({
		where: { id },
		data: {
			...form
		},
		include: { form_template: true }
	});

	if (
		shouldSendEmailsAboutDeletion(currentForm?.isDeleted, deletedForm.isDeleted)
	) {
		const accessRights = await ctx.prisma.accessRight.findMany({
			where: {
				product_id: deletedForm.product_id
			}
		});

		const adminEntityRights = await ctx.prisma.adminEntityRight.findMany({
			where: {
				entity_id: product?.entity_id
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
					id: product?.id as number,
					title: product?.title as string,
					entityName: product?.entity.name as string
				},
				baseUrl: process.env.NODEMAILER_BASEURL
			});

			await sendMail(
				`Fermeture du formulaire «${
					deletedForm.title ?? deletedForm.form_template.title
				}» du service «${product?.title}»`,
				email,
				emailHtml,
				`Fermeture du formulaire «${
					deletedForm.title || deletedForm.form_template.title
				}» du service «${product?.title}»`
			);
		}
	}

	return { data: deletedForm };
};
