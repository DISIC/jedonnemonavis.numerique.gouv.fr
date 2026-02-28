import type { Context } from '@/src/server/trpc';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const getButtonListInputSchema = z.object({
	numberPerPage: z.number(),
	page: z.number().default(1),
	form_id: z.number().optional(),
	isTest: z.boolean(),
	filterByTitle: z.string().optional()
});

export const getButtonListQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getButtonListInputSchema>;
}) => {
	const { numberPerPage, page, form_id, isTest, filterByTitle } = input;

	let where: Prisma.ButtonWhereInput = {
		isTest: {
			equals: !isTest ? false : undefined
		}
	};

	if (form_id) {
		where.form_id = form_id;
	}

	const entities = await ctx.prisma.button.findMany({
		where,
		take: numberPerPage,
		skip: (page - 1) * numberPerPage,
		orderBy: {
			title: filterByTitle === 'title:asc' ? 'asc' : 'desc'
		},
		include: {
			form: {
				include: {
					form_template: true
				}
			},
			form_template_button: {
				include: { variants: true }
			},
			closedButtonLog: true
		}
	});

	const count = await ctx.prisma.button.count({ where });

	return { data: entities, metadata: { count } };
};
