import { ButtonUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const createButtonInputSchema = ButtonUncheckedCreateInputSchema;

export const createButtonMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createButtonInputSchema>;
}) => {
	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		form_id: input.form_id as number
	});

	const newButton = await ctx.prisma.button.create({
		data: input,
		include: {
			form: {
				include: {
					form_template: true
				}
			},
			form_template_button: {
				include: {
					variants: true
				}
			}
		}
	});

	return { data: newButton };
};
