import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '@/src/server/trpc';
import { ReviewPartialWithRelationsSchema } from '@/prisma/generated/zod';
import { formatWhereAndOrder } from '@/src/utils/reviews';
import { formatDateToFrenchString } from '@/src/utils/tools';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import path from 'path';
import { getMemoryValue, setMemoryValue } from '@/src/utils/memoryStorage';
import { TRPCError } from '@trpc/server';

export const reviewRouter = router({
	getList: protectedProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				product_id: z.number().optional(),
				shouldIncludeAnswers: z.boolean().optional().default(false),
				mustHaveVerbatims: z.boolean().optional().default(false),
				sort: z.string().optional(),
				search: z.string().optional(),
				start_date: z.string().optional(),
				end_date: z.string().optional(),
				newReviews: z.boolean().optional(),
				needLogging: z.boolean().optional().default(false),
				loggingFromMail: z.boolean().optional(),
				filters: z
					.object({
						satisfaction: z.array(z.string()).optional(),
						comprehension: z.array(z.string()).optional(),
						needVerbatim: z.boolean().optional(),
						needOtherDifficulties: z.boolean().optional(),
						needOtherHelp: z.boolean().optional(),
						help: z.array(z.string()).optional(),
						buttonId: z.array(z.string()).optional()
					})
					.optional()
			})
		)
		.output(
			z.object({
				data: z.array(ReviewPartialWithRelationsSchema),
				metadata: z.object({
					countFiltered: z.number(),
					countAll: z.number(),
					countNew: z.number(),
					countForm1: z.number(),
					countForm2: z.number()
				})
			})
		)
		.query(async ({ ctx, input }) => {
			const { numberPerPage, page, shouldIncludeAnswers, product_id } = input;

			const { where, orderBy } = formatWhereAndOrder(input);

			const product = await ctx.prisma.product.findUnique({
				where: {
					id: product_id
				}
			});

			const lastSeenReview = await ctx.prisma.userEvent.findMany({
				where: {
					user_id: parseInt(ctx.session?.user?.id),
					action: 'service_reviews_view',
					product_id: product_id
				},
				orderBy: {
					created_at: 'desc'
				},
				take: 1
			})

			if (!product?.isPublic && !ctx.session?.user) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'This product is not public'
				});
			}

			const [reviews, countFiltered, countAll, countNew, countForm1, countForm2] =
				await Promise.all([
					ctx.prisma.review.findMany({
						where,
						orderBy: orderBy,
						take: numberPerPage,
						skip: (page - 1) * numberPerPage,
						include: {
							answers: shouldIncludeAnswers
								? {
										include: {
											parent_answer: true
										},
										where: {
											...(input.end_date && {
												created_at: {
													...(input.start_date && {
														gte: new Date(input.start_date)
													}),
													lte: (() => {
														const adjustedEndDate = new Date(input.end_date);
														adjustedEndDate.setHours(23, 59, 59);
														return adjustedEndDate;
													})()
												}
											})
										}
									}
								: false
						}
					}),
					ctx.prisma.review.count({ where }),
					ctx.prisma.review.count({
						where: {
							product_id: input.product_id
						}
					}),
					lastSeenReview[0] ? ctx.prisma.review.count({
						where: {
							product_id: input.product_id,
							...(lastSeenReview[0] && {
								created_at: {
									gte: lastSeenReview[0].created_at
								}
							})
						}
					}) : 0,
					ctx.prisma.review.count({
						where: {
							...where,
							form_id: 1
						}
					}),
					ctx.prisma.review.count({
						where: {
							...where,
							form_id: 2
						}
					})
				]);

			if(input.needLogging) {
				const user = ctx.session?.user;
				if(user) {
					await ctx.prisma.userEvent.create({
						data: {
							user_id: parseInt(user.id),
							action: input.loggingFromMail ? 'service_reviews_report_view' : 'service_reviews_view',
							product_id: product_id,
							metadata: input
						}
					});
				}
			}

			return {
				data: reviews,
				metadata: { countFiltered, countAll, countNew, countForm1, countForm2 }
			};
		}),

	countReviews: publicProcedure
		.input(
			z.object({
				numberPerPage: z.number(),
				page: z.number().default(1),
				product_id: z.number().optional(),
				shouldIncludeAnswers: z.boolean().optional().default(false),
				mustHaveVerbatims: z.boolean().optional().default(false),
				sort: z.string().optional(),
				search: z.string().optional(),
				start_date: z.string().optional(),
				end_date: z.string().optional(),
				newReviews: z.boolean().optional(),
				needLogging: z.boolean().optional().default(false),
				loggingFromMail: z.boolean().optional(),
				filters: z
					.object({
						satisfaction: z.array(z.string()).optional(),
						comprehension: z.array(z.string()).optional(),
						needVerbatim: z.boolean().optional(),
						needOtherDifficulties: z.boolean().optional(),
						needOtherHelp: z.boolean().optional(),
						help: z.array(z.string()).optional(),
						buttonId: z.array(z.string()).optional()
					})
					.optional()
			})
		)
		.output(
			z.object({
				metadata: z.object({
					countFiltered: z.number(),
					countAll: z.number(),
					countForm1: z.number(),
					countForm2: z.number()
				})
			})
		)
		.query(async ({ ctx, input }) => {

			const { where } = formatWhereAndOrder(input);

			const [countFiltered, countAll, countForm1, countForm2] =
				await Promise.all([
					ctx.prisma.review.count({ where }),
					ctx.prisma.review.count({
						where: {
							product_id: input.product_id
						}
					}),
					ctx.prisma.review.count({
						where: {
							...where,
							form_id: 1
						}
					}),
					ctx.prisma.review.count({
						where: {
							...where,
							form_id: 2
						}
					})
				]);

				return {
					metadata: { countFiltered, countAll, countForm1, countForm2 }
				};
		}),

	exportData: protectedProcedure
		.input(
			z.object({
				product_id: z.number().optional(),
				shouldIncludeAnswers: z.boolean().optional().default(false),
				mustHaveVerbatims: z.boolean().optional().default(false),
				sort: z.string().optional(),
				search: z.string().optional(),
				start_date: z.string().optional(),
				end_date: z.string().optional(),
				button_id: z.number().optional(),
				filters: z
					.object({
						satisfaction: z.array(z.string()).optional(),
						comprehension: z.array(z.string()).optional(),
						needVerbatim: z.boolean().optional(),
						needOtherDifficulties: z.boolean().optional(),
						needOtherHelp: z.boolean().optional(),
						help: z.array(z.string()).optional()
					})
					.optional(),
				memoryKey: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const OpinionLabels: { code: string; label: string }[] = [
				{ code: 'satisfaction', label: 'Satisfaction démarche' },
				{ code: 'easy', label: 'Facilité démarche' },
				{ code: 'comprehension', label: 'Langage démarche' },
				{ code: 'difficulties', label: 'Difficultés' },
				{ code: 'difficulties_details', label: 'Difficultés détails' },
				{
					code: 'difficulties_details_verbatim',
					label: 'Difficultés verbatim'
				},
				{ code: 'contact', label: 'Contact tenté' },
				{ code: 'contact_reached', label: 'Contact réussi' },
				{ code: 'contact_channels', label: 'Contact canal' },
				{ code: 'contact_channels_verbatim', label: 'Contact canal verbatim' },
				{ code: 'contact_details', label: 'Contact détails' },
				{ code: 'contact_satisfaction', label: 'Contact satisfaction' },
				{ code: 'help', label: 'Aide' },
				{ code: 'help_details', label: 'Aide détails' },
				{ code: 'help_details_verbatim', label: 'Aide verbatim' },
				{ code: 'verbatim', label: 'Verbatim' }
			];

			const headers = ['Date', 'ID', 'Bouton'].concat(
				OpinionLabels.map(o => o.label)
			);

			const { where, orderBy } = formatWhereAndOrder(input);

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
					name = `avis_${batch[0].product.title.replace(/ /g, '_')}_${new Date().toISOString()}.csv`;
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
		}),

	getProgressionExport: protectedProcedure
		.input(
			z.object({
				memoryKey: z.string()
			})
		)
		.output(
			z.object({
				progress: z.number()
			})
		)
		.query(async ({ ctx, input }) => {
			return { progress: getMemoryValue(input.memoryKey) || 0 };
		}),

	getCounts: protectedProcedure
		.input(
			z.object({
				product_id: z.number().optional(),
				start_date: z.string().optional(),
				end_date: z.string().optional(),
				button_id: z.number().optional(),
				filters: z
					.object({
						satisfaction: z.array(z.string()).optional(),
						comprehension: z.array(z.string()).optional(),
						needVerbatim: z.boolean().optional(),
						needOtherDifficulties: z.boolean().optional(),
						needOtherHelp: z.boolean().optional(),
						help: z.array(z.string()).optional()
					})
					.optional()
			})
		)
		.output(
			z.object({
				countFiltered: z.number(),
				countAll: z.number()
			})
		)
		.query(async ({ ctx, input }) => {
			const { where, orderBy } = formatWhereAndOrder(input);

			const countFiltered = await ctx.prisma.review.count({ where });

			const countAll = await ctx.prisma.review.count({
				where: {
					product_id: input.product_id
				}
			});

			return { countFiltered, countAll };
		})
});
