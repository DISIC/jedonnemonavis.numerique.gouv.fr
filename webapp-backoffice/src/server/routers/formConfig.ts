import { FormConfigUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import { protectedProcedure, router } from '@/src/server/trpc';
import { z } from 'zod';

export const formConfigRouter = router({
	create: protectedProcedure
		.meta({ logEvent: true })
		.input(FormConfigUncheckedCreateInputSchema)
		.mutation(async ({ ctx, input }) => {
			const createdFormConfig = await ctx.prisma.formConfig.create({
				data: input,
				include: {
					form_config_displays: true,
					form_config_labels: true
				}
			});
			return { data: createdFormConfig };
		})
});
