import { TRPCError } from '@trpc/server';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { Context } from '@/src/server/trpc';
import { getDateWhereFromUTCRange, isValidDate } from '@/src/utils/tools';
import {
	LEGACY_FORM_IDS,
	decodeCursor,
	encodeCursor,
	getAuthorizedProductIds
} from './utils';

const dateString = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date au format YYYY-MM-DD attendue')
	.refine(isValidDate, 'Date invalide');

export const reviewsListInputSchema = z
	.object({
		form_id: z.number().int().positive(),
		product_id: z.number().int().positive().optional(),
		start_date: dateString.optional(),
		end_date: dateString.optional(),
		cursor: z.string().optional(),
		limit: z.number().int().min(1).max(100).default(50),
		include_answers: z
			.preprocess(
				v => (v === 'false' ? false : v === 'true' ? true : v),
				z.boolean()
			)
			.default(true)
	})
	.refine(
		input =>
			!input.start_date ||
			!input.end_date ||
			input.start_date <= input.end_date,
		{
			message: 'start_date doit être antérieure ou égale à end_date',
			path: ['end_date']
		}
	);

const answerSchema = z.object({
	field_code: z.string(),
	field_label: z.string(),
	answer_text: z.string(),
	answer_item_id: z.number().int(),
	intention: z.string().nullable(),
	kind: z.string(),
	parent_answer_id: z.number().int().nullable(),
	parent: z
		.object({
			field_code: z.string(),
			answer_text: z.string()
		})
		.nullable()
});

const reviewSchema = z.object({
	id: z.number().int(),
	created_at: z.string(),
	form_id: z.number().int(),
	product_id: z.number().int(),
	button_id: z.number().int(),
	form_template_slug: z.string(),
	xwiki_id: z.number().int().nullable(),
	has_verbatim: z.boolean(),
	answers: z.array(answerSchema).optional()
});

export const reviewsListOutputSchema = z.object({
	data: z.array(reviewSchema),
	metadata: z.object({
		next_cursor: z.string().nullable(),
		has_more: z.boolean(),
		limit: z.number().int()
	})
});

const baseSelect: Prisma.ReviewSelect = {
	id: true,
	created_at: true,
	form_id: true,
	product_id: true,
	button_id: true,
	xwiki_id: true,
	has_verbatim: true
};

const selectWithAnswers: Prisma.ReviewSelect = {
	...baseSelect,
	answers: {
		select: {
			field_code: true,
			field_label: true,
			answer_text: true,
			answer_item_id: true,
			intention: true,
			kind: true,
			parent_answer_id: true,
			parent_answer: { select: { field_code: true, answer_text: true } }
		}
	}
};

type ReviewRow = {
	id: number;
	created_at: Date;
	form_id: number;
	product_id: number;
	button_id: number;
	xwiki_id: number | null;
	has_verbatim: boolean;
	answers?: Array<{
		field_code: string;
		field_label: string;
		answer_text: string;
		answer_item_id: number;
		intention: string | null;
		kind: string;
		parent_answer_id: number | null;
		parent_answer: { field_code: string; answer_text: string } | null;
	}>;
};

export const reviewsListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof reviewsListInputSchema>;
}) => {
	const {
		form_id,
		product_id,
		start_date,
		end_date,
		cursor,
		limit,
		include_answers
	} = input;

	const isAdmin = ctx.api_key?.scope.includes('admin') ?? false;
	const authorized_products_ids = await getAuthorizedProductIds(ctx);

	const notFound = () =>
		new TRPCError({
			code: 'NOT_FOUND',
			message: 'Formulaire introuvable ou inaccessible'
		});

	const form = await ctx.prisma.form.findUnique({
		where: { id: form_id },
		include: { form_template: { select: { slug: true } } }
	});

	if (
		!form ||
		form.deleted_at !== null ||
		form.isDeleted === true ||
		(!isAdmin && !authorized_products_ids.includes(form.product_id)) ||
		(!isAdmin && form.legacy && LEGACY_FORM_IDS.includes(form_id))
	) {
		throw notFound();
	}

	if (product_id !== undefined && product_id !== form.product_id) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'product_id incohérent avec form_id'
		});
	}

	const where: Prisma.ReviewWhereInput = {
		product_id: form.product_id,
		form_id: form.legacy
			? { in: Array.from(new Set([...LEGACY_FORM_IDS, form_id])) }
			: form_id
	};

	if (start_date || end_date) {
		where.created_at = getDateWhereFromUTCRange(start_date, end_date);
	}

	if (cursor) {
		const decoded = decodeCursor(cursor);
		if (!decoded) {
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cursor invalide' });
		}
		const ts = new Date(decoded.ts);
		where.OR = [
			{ created_at: { lt: ts } },
			{ created_at: ts, id: { lt: decoded.id } }
		];
	}

	const rows = (await ctx.prisma.review.findMany({
		where,
		orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
		take: limit + 1,
		select: include_answers ? selectWithAnswers : baseSelect
	})) as unknown as ReviewRow[];

	const has_more = rows.length > limit;
	const page = has_more ? rows.slice(0, limit) : rows;
	const last = page[page.length - 1];
	const next_cursor =
		has_more && last
			? encodeCursor({ ts: last.created_at.toISOString(), id: last.id })
			: null;

	await ctx.prisma.apiKeyLog.create({
		data: {
			apikey_id: ctx.api_key?.id ?? 0,
			url: ctx.req.url ?? ''
		}
	});

	const data = page.map(r => {
		const base = {
			id: r.id,
			created_at: r.created_at.toISOString(),
			form_id: r.form_id,
			product_id: r.product_id,
			button_id: r.button_id,
			form_template_slug: form.form_template.slug,
			xwiki_id: r.xwiki_id ?? null,
			has_verbatim: r.has_verbatim
		};
		if (!r.answers) return base;
		return {
			...base,
			answers: r.answers.map(a => ({
				field_code: a.field_code,
				field_label: a.field_label,
				answer_text: a.answer_text,
				answer_item_id: a.answer_item_id,
				intention: a.intention,
				kind: a.kind,
				parent_answer_id: a.parent_answer_id,
				parent: a.parent_answer
					? {
							field_code: a.parent_answer.field_code,
							answer_text: a.parent_answer.answer_text
					  }
					: null
			}))
		};
	});

	return { data, metadata: { next_cursor, has_more, limit } };
};
