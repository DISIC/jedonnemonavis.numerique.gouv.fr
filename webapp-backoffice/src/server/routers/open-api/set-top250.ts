import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '@/src/server/trpc';

export const setTop250Mutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: { form_ids: number[] };
}) => {
	const { form_ids } = input;

	if (!ctx.user_api?.role.includes('admin')) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You need to be admin to perform this action'
		});
	}

	const requestedForms = await ctx.prisma.form.findMany({
		where: { id: { in: form_ids } },
		select: { id: true, product_id: true, form_template: { select: { slug: true } } }
	});

	const missingFormIds = form_ids.filter(
		id => !requestedForms.some(f => f.id === id)
	);
	if (missingFormIds.length > 0) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: `Les form_ids suivants n'existent pas en base : ${missingFormIds.join(
				', '
			)}`
		});
	}

	const nonRootFormIds = requestedForms
		.filter(f => f.form_template.slug !== 'root')
		.map(f => f.id);
	if (nonRootFormIds.length > 0) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: `Les form_ids suivants ne sont pas des formulaires racine (root) : ${nonRootFormIds.join(
				', '
			)}`
		});
	}

	const actualTop250Forms = await ctx.prisma.form.findMany({
		where: { isTop250: true },
		select: { id: true }
	});

	const actualTop250FormIds = actualTop250Forms.map(f => f.id);

	const new_top250_forms = form_ids.filter(
		id => !actualTop250FormIds.includes(id)
	);
	const already_top250_forms = form_ids.filter(id =>
		actualTop250FormIds.includes(id)
	);
	const down_top250_forms = actualTop250FormIds.filter(
		id => !form_ids.includes(id)
	);

	const newProductIds = [
		...new Set(
			requestedForms
				.filter(f => new_top250_forms.includes(f.id))
				.map(f => f.product_id)
		)
	];

	await ctx.prisma.$transaction([
		ctx.prisma.form.updateMany({
			where: { id: { in: new_top250_forms } },
			data: { isTop250: true }
		}),
		ctx.prisma.product.updateMany({
			where: { id: { in: newProductIds } },
			data: { isPublic: true, hasBeenTop250: true }
		}),
		ctx.prisma.form.updateMany({
			where: { id: { in: down_top250_forms } },
			data: { isTop250: false }
		})
	]);

	return {
		result: {
			new_top250_forms,
			already_top250_forms,
			down_top250_forms
		}
	};
};

export const setTop250InputSchema = z.object({
	form_ids: z.array(z.number())
});

export const setTop250OutputSchema = z.object({
	result: z.object({
		new_top250_forms: z.array(z.number()),
		already_top250_forms: z.array(z.number()),
		down_top250_forms: z.array(z.number())
	})
});
