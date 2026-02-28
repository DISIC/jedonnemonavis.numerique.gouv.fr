import type { Context } from '@/src/server/trpc';
import { renderProductRestoredEmail } from '@/src/utils/emails';
import { sendMail } from '@/src/utils/mailer';
import { z } from 'zod';
import { checkRightToProceed } from './utils';

export const restoreProductInputSchema = z.object({ product_id: z.number() });

export const restoreProductMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof restoreProductInputSchema>;
}) => {
	const { product_id } = input;

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session,
		product_id
	});

	const updatedProduct = await ctx.prisma.product.update({
		where: { id: product_id },
		data: {
			status: 'published'
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
		const emailHtml = await renderProductRestoredEmail({
			userName: ctx.session!.user.name || "Quelqu'un",
			productTitle: updatedProduct.title,
			productId: updatedProduct.id,
			baseUrl: process.env.NODEMAILER_BASEURL
		});

		await sendMail(
			`Restauration du service « ${updatedProduct.title} » sur la plateforme « Je donne mon avis »`,
			email,
			emailHtml,
			`Le produit numérique "${updatedProduct.title}" a été restauré.`
		);
	}

	return { data: updatedProduct };
};
