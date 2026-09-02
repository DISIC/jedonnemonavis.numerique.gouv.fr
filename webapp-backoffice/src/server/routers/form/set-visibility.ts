import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const setFormVisibilityInputSchema = z.object({
	form_id: z.number(),
	product_id: z.number(),
	isPublic: z.boolean()
});

export const setFormVisibilityOutputSchema = z.object({
	data: z.object({
		id: z.number(),
		isPublic: z.boolean()
	})
});

export const setFormVisibilityMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof setFormVisibilityInputSchema>;
}) => {
	const { form_id, product_id, isPublic } = input;

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id
	});

	const form = await ctx.prisma.form.findUnique({
		where: { id: form_id },
		select: {
			product_id: true,
			isTop250: true,
			form_template: { select: { hasStats: true } }
		}
	});

	if (!form || form.product_id !== product_id) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Form not found'
		});
	}

	if (!form.form_template.hasStats) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Ce formulaire ne dispose pas de statistiques.'
		});
	}

	if (form.isTop250) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message:
				'Les statistiques d’une démarche essentielle sont toujours publiques.'
		});
	}

	const updatedForm = await ctx.prisma.form.update({
		where: { id: form_id },
		data: { isPublic },
		select: { id: true, isPublic: true }
	});

	return { data: updatedForm };
};
