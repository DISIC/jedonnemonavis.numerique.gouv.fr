import type { Context } from '@/src/server/trpc';
import { formatWhereAndOrder } from '@/src/utils/reviews';
import { setMemoryValue } from '@/src/utils/memoryStorage';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import path from 'path';
import { z } from 'zod';

export const exportReviewDataInputSchema = z.object({
	product_id: z.number().optional(),
	form_id: z.number().optional(),
	shouldIncludeAnswers: z.boolean().optional().default(false),
	mustHaveVerbatims: z.boolean().optional().default(false),
	sort: z.string().optional(),
	search: z.string().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	button_id: z.number().optional(),
	filters: z
		.object({
			needVerbatim: z.boolean().optional(),
			needOtherDifficulties: z.boolean().optional(),
			needOtherHelp: z.boolean().optional(),
			buttonId: z.array(z.string()).optional(),
			fields: z
				.array(
					z.object({
						field_code: z.string(),
						values: z.array(z.string())
					})
				)
				.optional()
		})
		.optional(),
	memoryKey: z.string()
});

export const exportReviewDataMutation = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof exportReviewDataInputSchema>;
}) => {
	const OpinionLabels: { code: string; label: string }[] = [
		{ code: 'satisfaction', label: 'Satisfaction démarche' },
		{ code: 'easy', label: 'Facilité démarche' },
		{ code: 'comprehension', label: 'Langage démarche' },
		{ code: 'difficulties', label: 'Difficultés' },
		{ code: 'difficulties_details', label: 'Difficultés détails' },
		{ code: 'difficulties_details_verbatim', label: 'Difficultés commentaire' },
		{ code: 'contact', label: 'Contact tenté' },
		{ code: 'contact_reached', label: 'Contact réussi' },
		{ code: 'contact_channels', label: 'Contact canal' },
		{ code: 'contact_channels_verbatim', label: 'Contact canal commentaire' },
		{ code: 'contact_details', label: 'Contact détails' },
		{ code: 'contact_satisfaction', label: 'Contact satisfaction' },
		{ code: 'help', label: 'Aide' },
		{ code: 'help_details', label: 'Aide détails' },
		{ code: 'help_details_verbatim', label: 'Aide commentaire' },
		{ code: 'verbatim', label: 'Commentaire' }
	];

	const headers = ['Date', 'ID', 'Bouton'].concat(
		OpinionLabels.map(o => o.label)
	);

	const { form_id } = input;

	const form = await ctx.prisma.form.findUnique({
		where: {
			id: form_id
		}
	});

	const { where, orderBy } = formatWhereAndOrder(input, !!form?.legacy);

	const totalRows = await ctx.prisma.review.count({ where });
	let processedRows = 0;

	let rows: string[][] = [];
	let name = '';

	while (processedRows < totalRows) {
		const batch = await ctx.prisma.review.findMany({
			where,
			orderBy: orderBy,
			take: 1000,
			skip: processedRows,
			include: { answers: true, button: true, product: true }
		});

		if (processedRows === 0) {
			name = `avis_${batch[0].product.title.replace(
				/ /g,
				'_'
			)}_${new Date().toISOString()}.csv`;
		}

		const tmpRows = batch
			.map(line => {
				return headers
					.map(header => {
						if (header === 'Date') {
							const value = formatDateToFrenchString(
								line.created_at?.toISOString().split('T')[0] || ''
							);
							return `"${String(value).replace(/"/g, '""')}"`;
						} else if (header === 'ID') {
							const value = line.id;
							return `"${String(value).replace(/"/g, '""')}"`;
						} else if (header === 'Bouton') {
							const value = line.button.title;
							return `"${String(value).replace(/"/g, '""')}"`;
						} else {
							const value =
								line.answers.find(
									a =>
										a.field_code ===
										(OpinionLabels.find(o => o.label === header)
											?.code as string)
								)?.answer_text || '';
							return `"${String(value).replace(/"/g, '""')}"`;
						}
					})
					.join('!-!');
			})
			.map((entry: string) =>
				entry.split('!-!').map(value => value.replace(/"/g, ''))
			);

		rows = rows.concat(tmpRows);

		processedRows += batch.length;

		setMemoryValue(input.memoryKey, (processedRows * 100) / totalRows);

		if (processedRows >= totalRows) {
			const csvWriter = createCsvWriter({
				path: path.join('/mnt/jdma/reviews', name),
				header: headers.map(header => {
					return { id: header, title: header };
				})
			});

			const records = rows.map(d => {
				return headers.reduce((acc: Record<string, any>, header, index) => {
					acc[header] = d[index];
					return acc;
				}, {});
			});

			await csvWriter
				.writeRecords(records)
				.then(() => {
					console.log('The CSV file was written successfully');
				})
				.catch(err => {
					console.error('Error writing CSV file', err);
				});

			return { fileName: name };
		}
	}
};
