import { ProductUncheckedCreateInputSchema } from '@/prisma/generated/zod';
import type { Context } from '@/src/server/trpc';
import { actionMapping, normalizeString } from '@/src/utils/tools';
import { z } from 'zod';

export const createProductInputSchema = ProductUncheckedCreateInputSchema;

export const createProductMutation = async ({
	ctx,
	input: productPayload
}: {
	ctx: Context;
	input: z.infer<typeof createProductInputSchema>;
}) => {
	const userEmail = ctx.session?.user?.email;

	productPayload.title_formatted = normalizeString(productPayload.title);

	const product = await ctx.prisma.product.create({
		data: {
			...productPayload,
			accessRights: {
				create: [
					{
						user_email: userEmail,
						status: 'carrier_admin'
					}
				]
			}
		}
	});

	const trpcQueries = (ctx.req.query.trpc as string)?.split(',');
	const inputObj = trpcQueries[0].includes('get')
		? ctx.req.query.input
			? JSON.parse(ctx.req.query.input as string)
			: { defaultKey: 'defaultValue' }
		: ctx.req.body && typeof ctx.req.body === 'string'
		? JSON.parse(ctx.req.body)
		: ctx.req.body || { defaultKey: 'defaultValue' };

	const action = actionMapping[trpcQueries[0]];
	const input = inputObj[0] !== undefined ? inputObj[0] : {};

	await ctx.prisma.userEvent.create({
		data: {
			user_id: parseInt(ctx.session!.user.id),
			action: 'service_create',
			product_id: product.id,
			metadata: input
		}
	});

	return { data: product };
};
