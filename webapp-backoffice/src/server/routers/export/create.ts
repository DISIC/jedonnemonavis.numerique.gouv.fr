import { TypeExportSchema } from '@/prisma/generated/zod';
import { exportQueue } from '@/src/lib/queue';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const createExportInputSchema = z.object({
	user_id: z.number(),
	params: z.string(),
	product_id: z.number(),
	form_id: z.number(),
	type: TypeExportSchema
});

export const createExportMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof createExportInputSchema>;
}) => {
	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id: input.product_id,
		authorizeCarrierUser: true
	});

	const exportCsv = await ctx.prisma.export.create({
		data: { ...input, status: 'idle' }
	});

	await exportQueue.add(
		'process',
		{ exportId: exportCsv.id },
		{ jobId: `export-${exportCsv.id}` }
	);

	return { data: exportCsv };
};
