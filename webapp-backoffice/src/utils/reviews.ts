import { AnswerIntention, Prisma } from '@prisma/client';
import { getDateWhereFromUTCRange } from './tools';

export const formatWhereAndOrder = (
	input: { [key: string]: any },
	isLegacy: boolean
) => {
	const {
		product_id,
		form_id,
		mustHaveVerbatims,
		mustHaveVerbatimsOptimzed,
		search,
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
		}),
		...(search && {
			OR: [
				{
					answers: {
						some: {
							AND: [
								...search
									.split(' ')
									.filter(Boolean)
									.map((word: string) => ({
										answer_text: { contains: word, mode: 'insensitive' }
									})),
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

	if (filters) {
		const fields: {
			key: keyof typeof filters;
			field: string;
			isText?: boolean;
		}[] = [
			{ key: 'comprehension', field: 'comprehension' },
			{ key: 'satisfaction', field: 'satisfaction' },
			{ key: 'needOtherHelp', field: 'help_details_verbatim', isText: false },
			{ key: 'difficulties', field: 'difficulties_details' },
			{ key: 'help', field: 'help_details' }
		];
		Object.keys(filters).map(key => {
			if (filters[key] && filters[key].length > 0) {
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
									field_code: fields.find(field => field.key === key)
										?.field as string,
									...(['satisfaction'].includes(key) && {
										intention: {
											in: filters[key] as AnswerIntention[]
										}
									}),
									...(['comprehension'].includes(key) && {
										answer_text: {
											in: filters[key] as string[]
										}
									})
								}
							].filter(Boolean)
						}
					}
				};
				andConditions.push(condition);
			}
		});
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
			const sortValues = value.split(':');
			if (value.includes('created_at')) {
				orderBy = [
					{
						[sortValues[0]]: sortValues[1]
					}
				];
			}
		});
	}

	return {
		where: where,
		orderBy: orderBy
	};
};
