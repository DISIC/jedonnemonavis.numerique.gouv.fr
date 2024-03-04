import { z } from 'zod';
import { router, publicProcedure } from '@/src/server/trpc';
import { ReviewPartialWithRelationsSchema } from '@/prisma/generated/zod';
import { formatWhereAndOrder } from '@/src/utils/reviews';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export const reviewRouter = router({
	getList: publicProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				product_id: z.number().optional(),
				shouldIncludeAnswers: z.boolean().optional().default(false),
				mustHaveVerbatims: z.boolean().optional().default(false),
				sort: z.string().optional(),
				search: z.string().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				button_id: z.number().optional(),
				filters: z.object({
					satisfaction: z.string().optional(),
					easy: z.string().optional(),
					comprehension: z.string().optional(),
					needVerbatim: z.boolean().optional(),
					needOtherDifficulties: z.boolean().optional(),
					needOtherHelp: z.boolean().optional(),
					difficulties: z.string().optional(),
					help: z.string().optional()
				}).optional()
			})
		)
		.output(
			z.object({
				data: z.array(ReviewPartialWithRelationsSchema),
				metadata: z.object({
					count: z.number()
				})
			})
		)
		.query(async ({ ctx, input }) => {
			const {
				numberPerPage,
				page,
				shouldIncludeAnswers
			} = input;

			const {where, orderBy} = formatWhereAndOrder(input)

			const [entities, count] = await Promise.all([
				ctx.prisma.review.findMany({
					where,
					orderBy: orderBy,
					take: numberPerPage,
					skip: (page - 1) * numberPerPage,
					include: { answers: shouldIncludeAnswers }
				}),
				ctx.prisma.review.count({ where })
			]);

			return { data: entities, metadata: { count } };
		}),
	
	exportData: publicProcedure
		.input(
			z.object({
				product_id: z.number().optional(),
				shouldIncludeAnswers: z.boolean().optional().default(false),
				mustHaveVerbatims: z.boolean().optional().default(false),
				sort: z.string().optional(),
				search: z.string().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				button_id: z.number().optional(),
				filters: z.object({
					satisfaction: z.string().optional(),
					easy: z.string().optional(),
					comprehension: z.string().optional(),
					needVerbatim: z.boolean().optional(),
					needOtherDifficulties: z.boolean().optional(),
					needOtherHelp: z.boolean().optional(),
					difficulties: z.string().optional(),
					help: z.string().optional()
				}).optional()
			})
		)
		.mutation(async ({ctx, input}) => {

			const OpinionLabels:{code: string, label: string}[] = [
				{code : 'satisfaction', label: "Satisfaction démarche"},
				{code : "easy", label: "Facilité démarche"},
				{code : "comprehension", label: "Langage démarche"},
				{code : "difficulties", label: "Difficultés"},
				{code : "difficulties_details", label: "Difficultés détails"},
				{code : "difficulties_details_verbatim", label: "Difficultés verbatim"},
				{code : "contact", label: "Contact tenté"},
				{code : "contact_reached", label: "Contact réussi"},
				{code : "contact_channels", label: "Contact canal"},
				{code : "contact_channels_verbatim", label: "Contact canal verbatim"},
				{code : "contact_details", label: "Contact détails"},
				{code : "contact_satisfaction", label: "Contact satisfaction"},
				{code : "help", label: "Aide"},
				{code : "help_details", label: "Aide détails"},
				{code : "help_details_verbatim", label: "Aide verbatim"},
				{code : "verbatim", label: "Verbatim"}
			]

			const headers = ['Date', 'ID', 'Bouton'].concat(OpinionLabels.map(o => o.label))

			const { where, orderBy } = formatWhereAndOrder(input)

			const countReviews = await ctx.prisma.review.count({ where })

			// MAYBE DO IT 100 BY 100 ?
			const lines = await ctx.prisma.review.findMany({
				where,
				orderBy: orderBy,
				take: countReviews,
				skip: 0,
				include: { answers: true, button: true, product: true }
			})

			const rows = lines.map(line => {
				return headers.map(header => {
					if(header === 'Date') {
						const value = formatDateToFrenchString(
							line.created_at?.toISOString().split('T')[0] || ''
						)
    					return `"${String(value).replace(/"/g, '""')}"`;
					} else if(header === 'ID') {
						const value = line.id
    					return `"${String(value).replace(/"/g, '""')}"`;
					} else if(header ==='Bouton') {
						const value = line.button.title
    					return `"${String(value).replace(/"/g, '""')}"`;
					} else {
						const value = line.answers.find(a => a.field_code === OpinionLabels.find(o => o.label === header)?.code as string)?.answer_text || '';
    					return `"${String(value).replace(/"/g, '""')}"`;
					}
				}).join('!-!')
			}).map((entry: string) => entry.split('!-!').map(value => value.replace(/"/g, '')));

			const name = `avis_${lines[0].product.title.replace(/ /g, '_')}_${new Date().toISOString()}.csv`

			const csvWriter = createCsvWriter({
				path: path.join('/mnt/jdma/reviews', name),
				header: headers.map(header => {
					return {id: header, title: header}
				})
			});

			const records = rows.map(d => {
				return headers.reduce((acc: Record<string, any>, header, index) => {
					acc[header] = d[index];
					return acc;
				}
				, {});
			});
		
			await csvWriter.writeRecords(records)
				.then(() => {
					console.log('The CSV file was written successfully');
				})
				.catch(err => {
					console.error('Error writing CSV file', err);
				});

			return {fileName: name};
		})
});
