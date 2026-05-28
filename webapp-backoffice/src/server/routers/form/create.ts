import { FormUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { FORM_INCLUDE } from './constants';

export const createFormInputSchema = FormUncheckedCreateInputSchema;

export const createFormMutation = async ({
	ctx,
	input: formPayload
}: {
	ctx: Context;
	input: z.infer<typeof createFormInputSchema>;
}) => {
	const template = await ctx.prisma.formTemplate.findUnique({
		where: { id: formPayload.form_template_id as number },
		select: { slug: true }
	});

	if (template?.slug === 'root') {
		const existingLockedRootForm = await ctx.prisma.form.findFirst({
			where: {
				product_id: formPayload.product_id as number,
				isTop250: true
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
			...formPayload
		},
		include: FORM_INCLUDE
	});

	return { data: form };
};
