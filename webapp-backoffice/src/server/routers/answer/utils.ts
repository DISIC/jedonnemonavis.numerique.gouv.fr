import { Client } from '@elastic/elasticsearch';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Session } from 'next-auth';
import { Buckets, ElkAnswer, ElkAnswerDefaults } from '../../../types/custom';
import { checkRightToProceed } from '../product/utils';

export const checkFormVisibility = async ({
	ctx,
	form
}: {
	ctx: { prisma: PrismaClient; session: Session | null };
	form: { isPublic: boolean; product_id: number };
}) => {
	if (form.isPublic) return;

	if (!ctx.session?.user)
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'These statistics are not public'
		});

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session,
		product_id: form.product_id,
		authorizeCarrierUser: true
	});
};

export const checkProductVisibility = async ({
	ctx,
	product
}: {
	ctx: { prisma: PrismaClient; session: Session | null };
	product: { id: number };
}) => {
	const publicForm = await ctx.prisma.form.findFirst({
		where: { product_id: product.id, isPublic: true },
		select: { id: true }
	});

	if (publicForm) return;

	if (!ctx.session?.user)
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'These statistics are not public'
		});

	await checkRightToProceed({
		prisma: ctx.prisma,
		session: ctx.session,
		product_id: product.id,
		authorizeCarrierUser: true
	});
};

export const checkAndGetProduct = async ({
	ctx,
	product_id
}: {
	ctx: { prisma: PrismaClient; session: Session | null };
	product_id: number;
}) => {
	const product = await ctx.prisma.product.findUnique({
		where: {
			id: product_id
		}
	});

	if (!product) throw new Error('Product not found');

	await checkProductVisibility({ ctx, product });

	return product;
};

export const checkAndGetForm = async ({
	ctx,
	form_id
}: {
	ctx: { prisma: PrismaClient; session: Session | null };
	form_id: number;
}) => {
	const form = await ctx.prisma.form.findUnique({
		where: {
			id: form_id
		}
	});

	if (!form) throw new Error('Form not found');

	await checkFormVisibility({ ctx, form });

	return form;
};

export const queryCountByFieldCode = ({
	field_code,
	product_id,
	button_id,
	start_date,
	end_date,
	form_id,
	only_parent_values,
	legacy,
	xwiki
}: {
	field_code: string;
	product_id: number;
	button_id?: number;
	start_date: string;
	end_date: string;
	form_id: number;
	only_parent_values?: boolean;
	legacy: boolean;
	xwiki?: boolean;
}): QueryDslQueryContainer => {
	const mustClauses: QueryDslQueryContainer[] = [
		{ term: { field_code } },
		{ term: { product_id } },
		{
			range: {
				created_at: {
					gte: start_date,
					lte: end_date
				}
			}
		}
	];

	if (xwiki) {
		return {
			bool: {
				must: mustClauses,
				must_not: {
					exists: {
						field: 'form_id'
					}
				}
			}
		};
	} else if (legacy) {
		mustClauses.push({
			bool: {
				should: [
					{ term: { form_id: form_id } },
					{ term: { form_id: 2 } },
					{ bool: { must_not: { exists: { field: 'form_id' } } } }
				]
			}
		});
	} else {
		mustClauses.push({
			term: { form_id }
		});
	}

	if (button_id !== undefined) {
		mustClauses.push({ term: { button_id } });
	}

	if (only_parent_values) {
		mustClauses.push({
			wildcard: {
				'answer_text.keyword': '*avec l\u2019administration'
			}
		});
	}

	return {
		bool: {
			must: mustClauses
		}
	};
};

export const getDefaultValues = async ({
	ctx,
	input
}: {
	ctx: { prisma: PrismaClient; elkClient: Client; session: Session | null };
	input: {
		field_code: string;
		exclude_values: string[];
		onlyParentValues?: boolean;
	};
}) => {
	const { field_code, exclude_values, onlyParentValues } = input;

	const defaultValues = await ctx.elkClient.search<ElkAnswerDefaults>({
		index: 'jdma-answers-defaults',
		query: {
			bool: {
				must: [
					{
						match: {
							field_code
						}
					}
				],
				must_not: exclude_values.map(value => ({
					match: {
						answer_text: value
					}
				}))
			}
		}
	});

	let tmpHits = defaultValues.hits.hits;

	if (onlyParentValues) {
		tmpHits = tmpHits.filter(
			hit =>
				hit._source &&
				hit._source.answer_text.includes('avec l\u2019administration')
		);
	}

	const defaultValuesBuckets = tmpHits.map(hit => {
		const { answer_text, intention, field_label } =
			hit._source as ElkAnswerDefaults;
		let tmpAnswerText = !onlyParentValues
			? answer_text
			: answer_text.replace(/\s*avec\s*l\u2019administration/, '');
		return {
			key: `${tmpAnswerText}#${intention}#${field_label}`,
			doc_count: 0
		};
	});

	return defaultValuesBuckets;
};

export const getDefaultChildValues = async ({
	ctx,
	input
}: {
	ctx: { prisma: PrismaClient; elkClient: Client; session: Session | null };
	input: {
		field_code: string;
		parentFieldCode: { key: string; value: string; doc_count: number }[];
		exclude_values: string[];
	};
}) => {
	const { field_code, parentFieldCode, exclude_values } = input;

	const defaultValues = await ctx.elkClient.search({
		index: 'jdma-answers-defaults',
		query: {
			bool: {
				must: [
					{
						match: {
							field_code
						}
					}
				]
			}
		}
	});

	let defaultValuesBuckets = parentFieldCode.flatMap(parentFieldCodeBucket => {
		return defaultValues.hits?.hits.map(hit => {
			const { answer_text, intention, field_label } = hit._source as any;
			return {
				key: `${parentFieldCodeBucket.key}#${answer_text}#${intention}#${field_label}`,
				doc_count: 0
			};
		});
	});

	defaultValuesBuckets = defaultValuesBuckets.filter(
		bucket =>
			!exclude_values.includes(bucket.key.split('#').slice(0, 2).join('#'))
	);

	return defaultValuesBuckets;
};
