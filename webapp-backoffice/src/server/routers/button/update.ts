import { ButtonUncheckedUpdateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const updateButtonInputSchema = ButtonUncheckedUpdateInputSchema;

export const updateButtonMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof updateButtonInputSchema>;
}) => {
	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		form_id: input.form_id as number
	});

	const updatedButton = await ctx.prisma.button.update({
		where: {
			id: input.id as number
		},
		data: input,
		include: {
			form: { include: { form_template: true } },
			form_template_button: {
				include: {
					variants: true
				}
			}
		}
	});

	return { data: updatedButton };
};
