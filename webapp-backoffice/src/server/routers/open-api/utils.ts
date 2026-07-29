import type { Context } from '@/src/server/trpc';

export const LEGACY_FORM_IDS: readonly number[] = [1, 2];

export const getAuthorizedProductIds = async (
	ctx: Context
): Promise<number[]> => {
	if (ctx.api_key?.product_id) {
		return [ctx.api_key.product_id];
	}

	if (ctx.api_key?.entity_id) {
		const entity = await ctx.prisma.entity.findFirst({
			where: { id: ctx.api_key.entity_id },
			include: { products: { select: { id: true } } }
		});

		if (entity?.products) {
			return entity.products.map(p => p.id);
		}
	}

	return [];
};

export type ReviewCursor = { ts: string; id: number };

export const encodeCursor = (cursor: ReviewCursor): string =>
	Buffer.from(JSON.stringify(cursor), 'utf-8').toString('base64url');

export const decodeCursor = (raw: string): ReviewCursor | null => {
	try {
		const parsed = JSON.parse(
			Buffer.from(raw, 'base64url').toString('utf-8')
		) as unknown;
		if (
			typeof parsed !== 'object' ||
			parsed === null ||
			typeof (parsed as ReviewCursor).ts !== 'string' ||
			typeof (parsed as ReviewCursor).id !== 'number' ||
			Number.isNaN(Date.parse((parsed as ReviewCursor).ts))
		) {
			return null;
		}
		return parsed as ReviewCursor;
	} catch {
		return null;
	}
};
