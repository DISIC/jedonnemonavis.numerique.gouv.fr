import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product';
import { FORM_INCLUDE } from './constants';

export const createFormInputSchema = z.object({
	title: z.string().nullish(),
	product_id: z.number(),
	form_template_id: z.number()
});

export const createFormMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createFormInputSchema>;
}) => {
	const { title, product_id, form_template_id } = input;

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id
	});

	const template = await ctx.prisma.formTemplate.findUnique({
		where: { id: form_template_id },
		select: { slug: true }
	});

	if (!template) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Form template not found'
		});
	}

	if (template.slug === 'root') {
		const existingLockedRootForm = await ctx.prisma.form.findFirst({
			where: {
				product_id,
				isTop250: true,
				isDeleted: { not: true }
			},
			select: { id: true }
		});

		if (existingLockedRootForm) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message:
					'Ce service possède déjà un formulaire démarche essentielle verrouillé.'
			});
		}
	}

	const form = await ctx.prisma.form.create({
		data: {
			title,
			product_id,
			form_template_id,
			user_id: parseInt(ctx.session!.user.id)
		},
		include: FORM_INCLUDE
	});

	return { data: form };
};
