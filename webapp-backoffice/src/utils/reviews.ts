import { Prisma } from '@prisma/client';
import {
	escapePostgresRegex,
	getExactPhrase,
	isExactPhraseSearch,
	stripAccents
} from './search';
import { getDateWhereFromUTCRange } from './tools';

export const buildSearchWhereRaw = (search: string): Prisma.Sql | null => {
	if (!search) return null;

	if (isExactPhraseSearch(search)) {
		const phrase = stripAccents(getExactPhrase(search)).toLowerCase();
		if (!phrase) return null;
		const pattern = `\\y${escapePostgresRegex(phrase)}\\y`;
		return Prisma.sql`public.immutable_unaccent(lower("answer_text")) ~ ${pattern}`;
	}

	const words = search.split(' ').filter(Boolean);
	if (words.length === 0) return null;

	const conditions = words.map(word => {
		const stripped = stripAccents(word).toLowerCase();
		const pattern = `\\m${escapePostgresRegex(stripped)}`;
		return Prisma.sql`public.immutable_unaccent(lower("answer_text")) ~ ${pattern}`;
	});

	return Prisma.join(conditions, ' AND ');
};

export const formatWhereAndOrder = (
	input: { [key: string]: any },
	isLegacy: boolean
) => {
	const {
		product_id,
		form_id,
		mustHaveVerbatims,
		mustHaveVerbatimsOptimzed,
		sort,
		start_date,
		end_date,
		filters,
		newReviews,
		lastSeenDate
	} = input;

	let where: Prisma.ReviewWhereInput = {
		...(product_id && { product_id }),
		...(form_id &&
			(isLegacy
				? { OR: [{ form_id }, { form_id: 1 }, { form_id: 2 }] }
				: { form_id })),
		...(filters?.buttonId?.length > 0 && {
			button_id: parseInt(filters.buttonId[0])
		}),
		...(newReviews &&
			lastSeenDate && {
				created_at: {
					gt: new Date(lastSeenDate)
				}
			}),
		...(!newReviews &&
			(start_date || end_date) && {
				created_at: getDateWhereFromUTCRange(input.start_date, input.end_date)
			}),
		...(mustHaveVerbatimsOptimzed && {
			has_verbatim: true
		}),
		...((mustHaveVerbatims || filters?.needVerbatim) && {
			OR: [
				{
					answers: {
						some: {
							AND: [
								{ field_code: 'verbatim' },
								!newReviews &&
									end_date && {
										created_at: getDateWhereFromUTCRange(
											input.start_date,
											input.end_date
										)
									}
							].filter(Boolean)
						}
					}
				}
			]
		})
	};

	let andConditions: Prisma.ReviewWhereInput[] = [];

	if (filters?.fields && filters.fields.length > 0) {
		filters.fields.forEach(
			(field: { field_code: string; values: string[] }) => {
				if (field.values && field.values.length > 0) {
					let condition: Prisma.ReviewWhereInput = {
						answers: {
							some: {
								AND: [
									!newReviews &&
										end_date && {
											created_at: getDateWhereFromUTCRange(
												input.start_date,
												input.end_date
											)
										},
									{
										field_code: field.field_code,
										answer_text: {
											in: field.values
										}
									}
								].filter(Boolean)
							}
						}
					};
					andConditions.push(condition);
				}
			}
		);
	}

	if (andConditions.length) {
		if (Array.isArray(where.AND)) where.AND = where.AND.concat(andConditions);
		else where.AND = andConditions;
	}

	let orderBy: Prisma.ReviewOrderByWithRelationAndSearchRelevanceInput[] = [
		{
			created_at: 'asc'
		}
	];

	if (sort) {
		const values: string[] = sort.split(';');
		values.forEach(value => {
			const [field, direction] = value.split(':');
			if (
				field === 'created_at' &&
				(direction === 'asc' || direction === 'desc')
			) {
				orderBy = [{ created_at: direction }];
			}
		});
	}

	return {
		where: where,
		orderBy: orderBy
	};
};
