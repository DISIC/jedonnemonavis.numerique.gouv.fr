import { FormUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
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
	const form = await ctx.prisma.form.create({
		data: {
			...formPayload
		},
		include: FORM_INCLUDE
	});

	return { data: form };
};
