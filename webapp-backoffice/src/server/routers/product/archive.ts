import type { Context } from '@/src/server/trpc';
import { renderProductArchivedEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { z } from 'zod';
import { checkRightToProceed } from './utils';

export const archiveProductInputSchema = z.object({ product_id: z.number() });

export const archiveProductMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof archiveProductInputSchema>;
}) => {
	const { product_id } = input;

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id
	});

	const updatedProduct = await ctx.prisma.product.update({
		where: { id: product_id },
		data: {
			status: 'archived'
		}
	});

	const accessRights = await ctx.prisma.accessRight.findMany({
		where: {
			product_id: updatedProduct.id
		}
	});

	const adminEntityRights = await ctx.prisma.adminEntityRight.findMany({
		where: {
			entity_id: updatedProduct.entity_id
		}
	});

	const emails = [
		...accessRights.map(ar => ar.user_email),
		...adminEntityRights.map(aer => aer.user_email)
	].filter(email => email !== null) as string[];

	for (const email of emails) {
		const emailHtml = await renderProductArchivedEmail({
			userName: ctx.session!.user.name || "Quelqu'un",
			productTitle: updatedProduct.title,
			baseUrl: process.env.NODEMAILER_BASEURL
		});

		await sendMail(
			`Suppression du service « ${updatedProduct.title} » sur la plateforme « Je donne mon avis »`,
			email,
			emailHtml,
			`Le produit numérique "${updatedProduct.title}" a été supprimé.`
		);
	}

	return { data: updatedProduct };
};
