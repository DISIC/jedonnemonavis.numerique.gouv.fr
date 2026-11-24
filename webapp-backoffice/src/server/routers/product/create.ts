import type { Context } from '@/src/server/trpc';
import { actionMapping, isHttpUrl, normalizeString } from '@/src/utils/tools';
import { z } from 'zod';

const productUrlSchema = z
	.string()
	.trim()
	.regex(/^[^\x00-\x1f\x7f]*$/)
	.refine(url => !/^[a-z][a-z0-9+.-]*:/i.test(url) || isHttpUrl(url), {
		message: 'URL must use http or https'
	});

export const productEditableFieldsSchema = z.object({
	title: z.string().min(1),
	entity_id: z.number(),
	urls: z.array(productUrlSchema).optional(),
	volume: z.number().int().nullable().optional()
});

export const createProductInputSchema = productEditableFieldsSchema;

export const createProductMutation = async ({
	ctx,
	input: productPayload
}: {
	ctx: Context;
	input: z.infer<typeof createProductInputSchema>;
}) => {
	const userEmail = ctx.session?.user?.email;

	const product = await ctx.prisma.product.create({
		data: {
			title: productPayload.title,
			title_formatted: normalizeString(productPayload.title),
			entity_id: productPayload.entity_id,
			urls: productPayload.urls,
			volume: productPayload.volume,
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
