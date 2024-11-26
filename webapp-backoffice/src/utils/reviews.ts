import { AnswerIntention, Prisma } from '@prisma/client';
import { Condition } from '../types/custom';

export const formatWhereAndOrder = (input: { [key: string]: any }) => {
	const {
		product_id,
		mustHaveVerbatims,
		search,
		sort,
		start_date,
		end_date,
		button_id,
		filters
	} = input;

	console.log('filters : ', filters)

	let where: Prisma.ReviewWhereInput = {
		...(product_id && { product_id }),
		...(filters?.buttonId?.length > 0 && { button_id: parseInt(filters.buttonId[0]) }),
		...(end_date && {
			created_at: {
				...(start_date && { gte: new Date(start_date) }),
				lte: (() => {
					const adjustedend_date = new Date(end_date);
					adjustedend_date.setHours(23, 59, 59);
					return adjustedend_date;
				})()
			}
		}),
		...((mustHaveVerbatims || filters?.needVerbatim) && {
			OR: [
				{
					answers: {
						some: {
							AND: [
								{ field_code: 'verbatim' },
								end_date && {
									created_at: {
										...(start_date && { gte: new Date(start_date) }),
										lte: (() => {
											const adjustedend_date = new Date(end_date);
											adjustedend_date.setHours(23, 59, 59);
											return adjustedend_date;
										})()
									}
								}
							]
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
								{ answer_text: { search: search.split(' ').filter((item: string) => item !== '').join('&') } },
								{ field_code: 'verbatim' },
								end_date && {
									created_at: {
										...(start_date && { gte: new Date(start_date) }),
										lte: (() => {
											const adjustedend_date = new Date(end_date);
											adjustedend_date.setHours(23, 59, 59);
											return adjustedend_date;
										})()
									}
								}
							]
						}
					}
				}
			]
		})
	};

	console.log('where : ', where)

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
								end_date && {
									created_at: {
										...(start_date && { gte: new Date(start_date) }),
										lte: (() => {
											const adjustedend_date = new Date(end_date);
											adjustedend_date.setHours(23, 59, 59);
											return adjustedend_date;
										})()
									}
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
							]
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
