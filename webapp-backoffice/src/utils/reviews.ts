import { AnswerIntention, Prisma } from '@prisma/client';
import { Condition } from '../types/custom';

export const formatWhereAndOrder = (input: { [key: string]: any }) => {
	const {
		product_id,
		mustHaveVerbatims,
		search,
		sort,
		startDate,
		endDate,
		button_id,
		filters
	} = input;

	let where: Prisma.ReviewWhereInput = {
		...(product_id && { product_id }),
		...(button_id && { button_id }),
		...(endDate && {
			created_at: {
				...(startDate && { gte: new Date(startDate) }),
				lte: (() => {
					const adjustedEndDate = new Date(endDate);
					adjustedEndDate.setHours(23, 59, 59);
					return adjustedEndDate;
				})()
			}
		}),
		...((mustHaveVerbatims || filters?.needVerbatim) && {
			OR: [{ answers: { some: { field_code: 'verbatim' } } }]
		}),
		...(filters &&
			filters.needOtherHelp && {
				OR: [{ answers: { some: { field_code: 'help' } } }]
			}),
		...(search && {
			OR: [
				{
					answers: {
						some: {
							AND: [
								{ answer_text: { search: search.split(' ').join('&') } },
								{ field_code: 'verbatim' }
							]
						}
					}
				}
			]
		})
	};

	let andConditions: Condition[] = [];

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
				let condition: Condition = {
					answers: {
						some: {
							field_code: fields.find(field => field.key === key)
								?.field as string,
							...(['comprehension', 'satisfaction'].includes(key) && {
								intention: {
									in: filters[key] as AnswerIntention[]
								}
							}),
							...(['help'].includes(key) && {
								answer_text: {
									in: filters[key] as string[]
								}
							})
						}
					}
				};
				andConditions.push(condition);
			}
		});
	}

	if (andConditions.length) {
		where.AND = andConditions;
	}

	let orderBy: Prisma.ReviewOrderByWithRelationAndSearchRelevanceInput[] = [
		{
			created_at: 'asc'
		}
	];

	if (sort) {
		const values = sort.split(':');
		if (sort.includes('created_at')) {
			orderBy = [
				{
					[values[0]]: values[1]
				}
			];
		}
	}

	return {
		where: where,
		orderBy: orderBy
	};
};
