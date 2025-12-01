import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Product } from '@prisma/client';
import type { Context } from '@/src/server/trpc';

export const setTop250Mutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: { product_ids: number[] };
}) => {
	const { product_ids } = input;

	if (!ctx.user_api?.role.includes('admin')) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You need to be admin to perform this action'
		});
	}

	const actual250 = await ctx.prisma.product.findMany({
		where: {
			isTop250: true
		}
	});

	const actual250Ids: number[] = actual250.map((data: Product) => {
		return data.id;
	});

	const new_top250 = product_ids.filter(a => !actual250Ids.includes(a));
	const already_top250 = product_ids.filter(a => actual250Ids.includes(a));
	const down_top250 = actual250Ids.filter(a => !product_ids.includes(a));

	await ctx.prisma.product.updateMany({
		where: {
			id: {
				in: new_top250
			}
		},
		data: {
			isPublic: true,
			isTop250: true,
			hasBeenTop250: true
		}
	});

	await ctx.prisma.product.updateMany({
		where: {
			id: {
				in: down_top250
			}
		},
		data: {
			isTop250: false
		}
	});

	return {
		result: {
			new_top250,
			already_top250,
			down_top250
		}
	};
};

export const setTop250InputSchema = z.object({
	product_ids: z.array(z.number())
});

export const setTop250OutputSchema = z.object({
	result: z.object({
		new_top250: z.array(z.number()),
		already_top250: z.array(z.number()),
		down_top250: z.array(z.number())
	})
});
