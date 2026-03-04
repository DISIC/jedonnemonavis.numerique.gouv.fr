import type { Context } from '@/src/server/trpc';
import {
	getCalendarFormat,
	getCalendarInterval,
	getDiffDaysBetweenTwoDates
} from '@/src/utils/tools';
import { z } from 'zod';
import {
	checkAndGetForm,
	checkAndGetProduct,
	queryCountByFieldCode
} from './utils';

export const countByFieldCodePerMonthInputSchema = z.object({
	field_code: z.string(),
	product_id: z.number(),
	form_id: z.number(),
	button_id: z.number().optional(),
	start_date: z.string(),
	end_date: z.string()
});

export const countByFieldCodePerMonthQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof countByFieldCodePerMonthInputSchema>;
}) => {
	const { field_code, product_id, form_id, button_id, start_date, end_date } =
		input;

	await checkAndGetProduct({ ctx, product_id });
	const form = await checkAndGetForm({ ctx, form_id });

	const nbDays = getDiffDaysBetweenTwoDates(start_date, end_date);

	const data = await ctx.elkClient.search({
		index: 'jdma-answers',
		query: queryCountByFieldCode({
			...input,
			legacy: form.legacy
		}),
		aggs: {
			count_per_month: {
				date_histogram: {
					field: 'created_at',
					calendar_interval: getCalendarInterval(nbDays),
					format: getCalendarFormat(nbDays)
				},
				aggs:
					field_code === 'comprehension'
						? {
								average_answer_text: {
									avg: {
										field: 'answer_text_as_number'
									}
								}
						  }
						: undefined
			}
		},
		runtime_mappings: {
			answer_text_as_number: {
				type: 'long',
				script: {
					source: `
						if (doc['answer_text.keyword'].size() > 0) {
							emit(Long.parseLong(doc['answer_text.keyword'].value));
						}
					`
				}
			}
		}
	});

	const buckets = (
		data.aggregations?.count_per_month as {
			buckets: {
				doc_count: number;
				key_as_string: string;
				average_answer_text?: { value: number };
			}[];
		}
	).buckets.map(countByFieldCodePerMonth => {
		if (countByFieldCodePerMonth.average_answer_text) {
			return {
				value: countByFieldCodePerMonth.average_answer_text.value
					? Number(
							countByFieldCodePerMonth.average_answer_text.value.toFixed(1)
					  )
					: null,
				name: countByFieldCodePerMonth.key_as_string
			};
		}

		return {
			value: countByFieldCodePerMonth.doc_count,
			name: countByFieldCodePerMonth.key_as_string
		};
	});

	return { data: buckets };
};
