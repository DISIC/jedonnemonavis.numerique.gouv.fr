import { StatusExportSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { z } from 'zod';
import { checkRightToProceed } from '../product';

export const getExportListInputSchema = z.object({
	status: z.array(StatusExportSchema).optional(),
	product_id: z.number(),
	form_id: z.number()
});

export const getExportListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getExportListInputSchema>;
}) => {
	const { status, product_id, form_id } = input;

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session!,
		product_id,
		authorizeCarrierUser: true
	});

	const exports = await ctx.prisma.export.findMany({
		where: {
			...(status && { status: { in: status } }),
			product_id,
			form_id
		},
		orderBy: { created_at: 'desc' },
		take: 10,
		include: {
			user: { select: { firstName: true, lastName: true, email: true } }
		}
	});

	return { data: exports };
};
