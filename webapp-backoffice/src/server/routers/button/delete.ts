import { ButtonUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { renderClosedButtonOrFormEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { shouldSendEmailsAboutDeletion } from '@/src/utils/tools';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const deleteButtonInputSchema = z.object({
	buttonPayload: ButtonUncheckedUpdateInputSchema,
	shouldLogEvent: z.boolean().optional(),
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
	const { buttonPayload } = initialInput;

	const { product } = await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		form_id: buttonPayload.form_id as number
	});

	const currentButton = await ctx.prisma.button.findUnique({
		where: { id: buttonPayload.id as number },
		select: { isDeleted: true }
	});

	const deletedButton = await ctx.prisma.button.update({
		where: {
			id: buttonPayload.id as number
		},
		data: buttonPayload,
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
			currentButton?.isDeleted,
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
				buttonTitle: deletedButton.title,
				form: {
					id: deletedButton.form.id,
					title:
						deletedButton.form.title ?? deletedButton.form.form_template.title
				},
				product: {
					id: product?.id as number,
					title: product?.title as string,
					entityName: product?.entity.name as string
				},
				baseUrl: process.env.NODEMAILER_BASEURL
			});

			await sendMail(
				`Fermeture du lien d'intégration «${deletedButton.title}» du service «${product?.title}»`,
				email,
				emailHtml,
				`Fermeture du lien d'intégration «${deletedButton.title}» du service «${product?.title}»`
			);
		}
	}

	return { data: deletedButton };
};
