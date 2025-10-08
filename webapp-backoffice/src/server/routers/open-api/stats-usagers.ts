import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ZOpenApiStatsOutput } from '@/src/types/custom';
import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '@/src/utils/helpers';
import { fetchAndFormatData, FetchAndFormatDataProps } from '@/src/utils/stats';
import type { Context } from '@/src/server/trpc';

const MAX_NB_PRODUCTS = 10;

export const statsUsagersQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: {
		field_codes: string[];
		product_ids: number[];
		start_date: string;
		end_date: string;
		interval: 'day' | 'week' | 'month' | 'year' | 'none';
	};
}) => {
	const { field_codes, product_ids, start_date, end_date, interval } = input;

	const getAuthorizedProductIds = async (): Promise<number[]> => {
		if (ctx.api_key?.product_id) {
			return [ctx.api_key.product_id];
		}

		if (ctx.api_key?.entity_id) {
			const entity = await ctx.prisma.entity.findFirst({
				where: { id: ctx.api_key.entity_id },
				include: { products: true }
			});

			if (entity && entity.products) {
				return entity.products.map(prod => prod.id);
			}
		}

		return [];
	};

	const authorized_products_ids: number[] = await getAuthorizedProductIds();

	const allFields = [
		...FIELD_CODE_BOOLEAN_VALUES,
		...FIELD_CODE_SMILEY_VALUES,
		...FIELD_CODE_DETAILS_VALUES
	];

	let fetchParams: FetchAndFormatDataProps = {
		ctx,
		field_codes:
			field_codes.length > 0
				? allFields.filter(f => field_codes.includes(f.slug))
				: allFields,
		start_date,
		end_date,
		interval
	};

	if (!ctx.api_key?.scope.includes('admin')) {
		fetchParams.product_ids =
			product_ids.length > 0
				? authorized_products_ids.filter(value => product_ids.includes(value))
				: authorized_products_ids;
	} else {
		fetchParams.product_ids = product_ids;
	}

	if (
		!ctx.api_key?.scope.includes('admin') &&
		!fetchParams.product_ids.length
	) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message:
				"Les services demandés (product_ids) ne sont pas accessibles avec votre clé d'accès."
		});
	}

	const relevantProductIds = !ctx.api_key?.scope.includes('admin')
		? fetchParams.product_ids
		: product_ids;

	if (
		relevantProductIds.length === 0 ||
		relevantProductIds.length > MAX_NB_PRODUCTS
	) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: `Veuillez réduire le nombre de services requêtés (max ${MAX_NB_PRODUCTS})`
		});
	}

	const result = await fetchAndFormatData(fetchParams);

	await ctx.prisma.apiKeyLog.create({
		data: {
			apikey_id: ctx.api_key?.id || 0,
			url: ctx.req.url || ''
		}
	});

	return { data: result };
};

export const statsUsagersInputSchema = z.object({
	field_codes: z.array(z.string()),
	product_ids: z.array(z.number()),
	start_date: z.string(),
	end_date: z.string(),
	interval: z.enum(['day', 'week', 'month', 'year', 'none'])
});

export const statsUsagersOutputSchema = ZOpenApiStatsOutput;
