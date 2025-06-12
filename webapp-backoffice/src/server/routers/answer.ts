import { publicProcedure, router } from '@/src/server/trpc';
import {
	calculateBucketsAverage,
	getCalendarFormat,
	getCalendarInterval,
	getDiffDaysBetweenTwoDates
} from '@/src/utils/tools';
import { Client } from '@elastic/elasticsearch';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { AnswerIntention, PrismaClient } from '@prisma/client';
import { Session } from 'next-auth';
import { z } from 'zod';
import {
	Buckets,
	BucketsInside,
	ElkAnswer,
	ElkAnswerDefaults
} from '../../types/custom';

const checkAndGetProduct = async ({
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
	if (!product.isPublic && !ctx.session?.user)
		throw new Error('Product is not public');

	return product;
};

const queryCountByFieldCode = ({
	field_code,
	product_id,
	button_id,
	start_date,
	end_date,
	form_id,
	only_parent_values
}: {
	field_code: string;
	product_id: number;
	button_id?: number;
	start_date: string;
	end_date: string;
	form_id?: number;
	only_parent_values?: boolean;
}): QueryDslQueryContainer => {
	let query: QueryDslQueryContainer = {
		bool: {
			must: [
				{
					match: {
						field_code
					}
				},
				{
					match: {
						product_id
					}
				},
				{
					range: {
						created_at: {
							gte: start_date,
							lte: end_date
						}
					}
				}
			]
		}
	};

	// SPECIFIC CODE BECAUSE FORM_ID DOES NOT EXIST IN THE MIGRATED DATA
	if (query.bool && query.bool.must) {
		if (form_id && form_id === 1) {
			query.bool.must_not = {
				exists: {
					field: 'form_id'
				}
			};
		} else if (form_id) {
			(query.bool.must as QueryDslQueryContainer[]).push({
				match: {
					form_id
				}
			});
		}
		if (button_id) {
			(query.bool.must as QueryDslQueryContainer[]).push({
				match: {
					button_id
				}
			});
		}
	}

	if (only_parent_values && query.bool && query.bool.must) {
		(query.bool.must as QueryDslQueryContainer[]).push({
			wildcard: {
				'answer_text.keyword': '*avec l’administration'
			}
		});
	}

	return query;
};

const getDefaultValues = async ({
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
				hit._source && hit._source.answer_text.includes('avec l’administration')
		);
	}

	const defaultValuesBuckets = tmpHits.map(hit => {
		const { answer_text, intention, field_label } =
			hit._source as ElkAnswerDefaults;
		let tmpAnswerText = !onlyParentValues
			? answer_text
			: answer_text.replace(/\s*avec\s*l’administration/, '');
		return {
			key: `${tmpAnswerText}#${intention}#${field_label}`,
			doc_count: 0
		};
	});

	return defaultValuesBuckets;
};

const getDefaultChildValues = async ({
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

export const answerRouter = router({
	getByFieldCode: publicProcedure
		.input(
			z.object({
				field_code: z.string(),
				product_id: z.number() /* To change to button_id */,
				button_id: z.number().optional(),
				start_date: z.string(),
				end_date: z.string(),
				form_id: z.number().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, button_id, form_id } = input;

			await checkAndGetProduct({ ctx, product_id });

			const fieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				track_total_hits: true,
				query: queryCountByFieldCode({
					...input
				}),
				aggs: {
					term: {
						terms: {
							script:
								'doc["answer_text.keyword"].value + "#" + doc["intention.keyword"].value + "#" + doc["field_label.keyword"].value.trim()',
							size: 1000
						}
					}
				},
				size: 0
			});

			const uniqueCount = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				track_total_hits: true,
				query: queryCountByFieldCode({
					...input
				}),
				aggs: {
					unique_review_ids: {
						cardinality: {
							field: 'review_id',
							precision_threshold: 100000
						}
					}
				}
			});

			const tmpBuckets = (fieldCodeAggs?.aggregations?.term as any)
				?.buckets as Buckets;

			let metadata = {
				total: 0,
				average: 0
			} as {
				total: number;
				average: number;
				fieldLabel?: string;
			};

			metadata.total = (
				uniqueCount.aggregations as any
			).unique_review_ids.value;

			const defaultValues = await getDefaultValues({
				ctx,
				input: {
					field_code: input.field_code,
					exclude_values: tmpBuckets.map(bucket => bucket.key.split('#')[0])
				}
			});

			const buckets = [...tmpBuckets, ...defaultValues]
				.map(bucket => {
					const [answerText, intention, fieldLabel] = bucket.key.split('#');

					if (!metadata.fieldLabel) metadata.fieldLabel = fieldLabel;

					let returnValue = {
						answer_text: answerText,
						intention: intention as AnswerIntention,
						answer_score:
							intention === 'good' ? 10 : intention === 'medium' ? 5 : 0,
						doc_count: bucket.doc_count
					};

					return returnValue;
				})
				.sort((a, b) => {
					const aIntention = a.intention;
					const bIntention = b.intention;

					if (aIntention === 'good') return -1;
					if (bIntention === 'good') return 1;
					if (aIntention === 'medium') return -1;
					if (bIntention === 'medium') return 1;
					if (aIntention === 'bad') return -1;
					if (bIntention === 'bad') return 1;
					if (aIntention === 'neutral') return -1;
					if (bIntention === 'neutral') return 1;

					return 0;
				});

			if (!!metadata.total) {
				metadata.average = Number(
					(
						buckets.reduce((acc, curr) => {
							return acc + curr.answer_score * curr.doc_count;
						}, 0) / metadata.total
					).toFixed(1)
				);
			}

			return { data: buckets, metadata };
		}),

	getByChildFieldCode: publicProcedure
		.input(
			z.object({
				field_code: z.enum(['contact_reached', 'contact_satisfaction']),
				product_id: z.number() /* To change to button_id */,
				button_id: z.number().optional(),
				start_date: z.string(),
				end_date: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id } = input;

			await checkAndGetProduct({ ctx, product_id });

			const parentFieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				track_total_hits: true,
				query: {
					...queryCountByFieldCode({
						...input,
						field_code: 'contact_tried',
						only_parent_values: true
					})
				},
				aggs: {
					term: {
						terms: {
							script:
								'doc["answer_item_id"].value + "#" + doc["answer_text.keyword"].value',
							size: 1000
						}
					}
				},
				size: 0
			});

			const parentFieldCode = (
				(parentFieldCodeAggs?.aggregations?.term as any).buckets as Buckets
			).map(bucket => {
				const [key, value] = bucket.key.split('#');
				return {
					key,
					value: value.replace(/\s*avec\s*l’administration/, ''),
					doc_count: bucket.doc_count
				};
			});

			const fieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				track_total_hits: true,
				query: {
					...queryCountByFieldCode({
						...input
					})
				},
				aggs: {
					term: {
						terms: {
							script:
								"doc['parent_answer_item_id'].value + '#' + doc['answer_text.keyword'].value + '#' + doc['intention.keyword'].value + '#' + doc['field_label.keyword'].value",
							size: 1000
						}
					}
				},
				size: 0
			});

			const tmpBuckets = (fieldCodeAggs?.aggregations?.term as any)
				?.buckets as Buckets;

			let metadata = {
				total: 0,
				average: 0
			} as {
				total: number;
				average: number;
				fieldLabel?: string;
			};

			metadata.total = (fieldCodeAggs.hits?.total as any)?.value;

			const defaultValues = await getDefaultChildValues({
				ctx,
				input: {
					field_code: input.field_code,
					parentFieldCode,
					exclude_values: tmpBuckets.flatMap(intervalBucket =>
						intervalBucket.key.split('#').slice(0, 2).join('#')
					)
				}
			});

			const buckets = [...tmpBuckets, ...defaultValues]
				.map(bucket => {
					const [parentAnswerItemId, answerText, intention, fieldLabel] =
						bucket.key.split('#');

					if (!metadata.fieldLabel) metadata.fieldLabel = fieldLabel;

					let returnValue = {
						parent_answer_id: parentAnswerItemId,
						parent_answer_text: parentFieldCode.find(
							({ key }) => key === parentAnswerItemId
						)?.value as string,
						answer_text: answerText,
						intention: intention as AnswerIntention,
						answer_score:
							intention === 'good' ? 10 : intention === 'medium' ? 5 : 0,
						doc_count: bucket.doc_count
					};

					return returnValue;
				})
				.sort((a, b) => {
					const aIntention = a.intention;
					const bIntention = b.intention;

					if (aIntention === 'good') return -1;
					if (bIntention === 'good') return 1;
					if (aIntention === 'medium') return -1;
					if (bIntention === 'medium') return 1;
					if (aIntention === 'bad') return -1;
					if (bIntention === 'bad') return 1;
					if (aIntention === 'neutral') return -1;
					if (bIntention === 'neutral') return 1;

					return 0;
				});

			if (!!metadata.total) {
				metadata.average = Number(
					(
						buckets.reduce((acc, curr) => {
							return acc + curr.answer_score * curr.doc_count;
						}, 0) / metadata.total
					).toFixed(1)
				);
			}

			const groupedBuckets = buckets.reduce(
				(acc, curr) => {
					if (!acc[curr.parent_answer_text]) acc[curr.parent_answer_text] = [];
					acc[curr.parent_answer_text].push(curr);

					return acc;
				},
				{} as Record<string, any[]>
			);

			if (input.field_code === 'contact_reached') {
				Object.keys(groupedBuckets).forEach(currentKey => {
					const currentParentFieldCode = parentFieldCode.find(
						({ value }) => value === currentKey
					);

					if (!currentParentFieldCode) return;

					const currentDocCount = groupedBuckets[currentKey].reduce(
						(acc, curr) => acc + curr.doc_count,
						0
					);

					if (currentParentFieldCode.doc_count !== currentDocCount) {
						groupedBuckets[currentKey].push({
							parent_answer_id: currentParentFieldCode.key,
							parent_answer_text: currentParentFieldCode.value,
							answer_text: 'Pas de réponse',
							intention: 'neutral',
							answer_score: 0,
							doc_count: currentParentFieldCode.doc_count - currentDocCount
						});
					}
				});
			}

			return { data: groupedBuckets, metadata };
		}),

	countByFieldCode: publicProcedure
		.input(
			z.object({
				field_code: z.string(),
				product_id: z.number(),
				form_id: z.number().optional(),
				button_id: z.number().optional(),
				start_date: z.string(),
				end_date: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, form_id, button_id } = input;

			await checkAndGetProduct({ ctx, product_id });

			const form = await ctx.prisma.form.findUnique({
				where: {
					id: form_id
				}
			});

			const data = await ctx.elkClient.count({
				index: 'jdma-answers',
				query: queryCountByFieldCode({
					...input,
					...(form?.legacy
						? { OR: [{ form_id: form_id }, { form_id: null }] }
						: { form_id })
				})
			});

			return { data: data.count };
		}),

	countByFieldCodePerMonth: publicProcedure
		.input(
			z.object({
				field_code: z.string(),
				product_id: z.number() /* To change to button_id */,
				button_id: z.number().optional(),
				start_date: z.string(),
				end_date: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { field_code, product_id, button_id, start_date, end_date } = input;

			await checkAndGetProduct({ ctx, product_id });

			const nbDays = getDiffDaysBetweenTwoDates(start_date, end_date);

			const data = await ctx.elkClient.search({
				index: 'jdma-answers',
				query: queryCountByFieldCode({
					...input
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
							: 0,
						name: countByFieldCodePerMonth.key_as_string
					};
				}

				return {
					value: countByFieldCodePerMonth.doc_count,
					name: countByFieldCodePerMonth.key_as_string
				};
			});

			return { data: buckets };
		}),

	getByFieldCodeInterval: publicProcedure
		.input(
			z.object({
				field_code: z.string(),
				product_id: z.number() /* To change to button_id */,
				button_id: z.number().optional(),
				start_date: z.string(),
				end_date: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, start_date, end_date } = input;

			await checkAndGetProduct({ ctx, product_id });

			const nbDays = getDiffDaysBetweenTwoDates(start_date, end_date);

			const fieldCodeIntervalAggs = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				track_total_hits: true,
				query: queryCountByFieldCode({
					...input
				}),
				aggs: {
					count_per_month: {
						date_histogram: {
							field: 'created_at',
							calendar_interval: getCalendarInterval(nbDays),
							format: getCalendarFormat(nbDays),
							missing: 1
						},
						aggs: {
							term: {
								terms: {
									script:
										'doc["answer_text.keyword"].value + "#" + doc["intention.keyword"].value + "#" + doc["field_label.keyword"].value',
									size: 1000,
									missing: 1
								}
							}
						}
					}
				},
				size: 0
			});

			const tmpBuckets = (
				fieldCodeIntervalAggs?.aggregations?.count_per_month as any
			)?.buckets as BucketsInside;

			let metadata = { total: 0, average: 0 } as {
				total: number;
				average: number;
			};

			let returnValue: Record<
				string,
				Array<{
					answer_text: string;
					intention: AnswerIntention;
					doc_count: number;
				}>
			> = {};
			let bucketsAverage: number[] = [];

			const defaultValues = await getDefaultValues({
				ctx,
				input: {
					field_code: input.field_code,
					exclude_values: tmpBuckets.flatMap(intervalBucket =>
						intervalBucket.term.buckets.map(bucket => bucket.key.split('#')[0])
					)
				}
			});

			tmpBuckets.forEach(bucketInterval => {
				let currentBucketTotal = 0;

				if (!returnValue[bucketInterval.key_as_string])
					returnValue[bucketInterval.key_as_string] = [];

				const currentDefaultValues = defaultValues.filter(
					({ key: defaultValueKey }) =>
						!bucketInterval.term.buckets.some(
							({ key: valueKey }) => valueKey === defaultValueKey
						)
				);

				[...bucketInterval.term.buckets, ...currentDefaultValues].forEach(
					bucket => {
						const [answerText, intention] = bucket.key.split('#');

						metadata.total += bucket.doc_count;
						currentBucketTotal += bucket.doc_count;

						returnValue[bucketInterval.key_as_string].push({
							answer_text: answerText,
							intention: intention as AnswerIntention,
							doc_count: bucket.doc_count
						});
					}
				);

				if (currentBucketTotal !== 0) bucketsAverage.push(currentBucketTotal);
			});

			metadata.average = Number(
				(
					bucketsAverage.reduce((acc, curr) => {
						return acc + curr;
					}, 0) / bucketsAverage.length
				).toFixed(1)
			);

			return { data: returnValue, metadata };
		}),

	getByChildFieldCodeInterval: publicProcedure
		.input(
			z.object({
				field_code: z.string(),
				product_id: z.number() /* To change to button_id */,
				button_id: z.number().optional(),
				start_date: z.string(),
				end_date: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, start_date, end_date } = input;

			await checkAndGetProduct({ ctx, product_id });

			const nbDays = getDiffDaysBetweenTwoDates(start_date, end_date);

			const parentFieldCodeAggs = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				track_total_hits: true,
				query: queryCountByFieldCode({
					...input,
					field_code: 'contact_tried'
				}),
				aggs: {
					term: {
						terms: {
							script:
								'doc["answer_item_id"].value + "#" + doc["answer_text.keyword"].value',
							size: 1000
						}
					}
				},
				size: 0
			});

			const parentFieldCode = (
				(parentFieldCodeAggs?.aggregations?.term as any).buckets as Buckets
			).map(bucket => {
				const [key, value] = bucket.key.split('#');
				return {
					key,
					value: value.replace(/\s*avec\s*l’administration/, ''),
					doc_count: bucket.doc_count
				};
			});

			const fieldCodeIntervalAggs = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				track_total_hits: true,
				query: queryCountByFieldCode({
					...input
				}),
				aggs: {
					count_per_month: {
						date_histogram: {
							field: 'created_at',
							calendar_interval: getCalendarInterval(nbDays),
							format: getCalendarFormat(nbDays),
							missing: 1
						},
						aggs: {
							term: {
								terms: {
									script:
										'doc["parent_answer_item_id"].value + "#" + doc["intention.keyword"].value + "#" + doc["field_label.keyword"].value',
									size: 1000,
									missing: 1
								}
							}
						}
					}
				},
				size: 0
			});

			const tmpBuckets = (
				fieldCodeIntervalAggs?.aggregations?.count_per_month as any
			)?.buckets as BucketsInside;

			let metadata = { total: 0, average: 0 } as {
				total: number;
				average: number;
			};

			let returnValue: Record<
				string,
				Array<{
					answer_text: string;
					intention: AnswerIntention;
					doc_count: number;
				}>
			> = {};
			let bucketsAverage: number[] = [];

			let defaultValues = await getDefaultValues({
				ctx,
				input: {
					field_code: 'contact_tried',
					exclude_values: [],
					onlyParentValues: true
				}
			});

			tmpBuckets.forEach(bucketInterval => {
				let currentBucketTotal = 0;

				if (!returnValue[bucketInterval.key_as_string])
					returnValue[bucketInterval.key_as_string] = [];

				bucketInterval.term.buckets.forEach(bucket => {
					const [parentAnswerId, intention] = bucket.key.split('#');

					const currentParentFieldCode = parentFieldCode.find(
						({ key }) => key === parentAnswerId
					);

					if (!currentParentFieldCode) return;

					metadata.total += bucket.doc_count;
					currentBucketTotal += bucket.doc_count;

					const currentBucket = returnValue[bucketInterval.key_as_string].find(
						({ answer_text }) => currentParentFieldCode.value === answer_text
					);

					if (currentBucket) {
						currentBucket.doc_count += bucket.doc_count;
					} else {
						returnValue[bucketInterval.key_as_string].push({
							answer_text: currentParentFieldCode.value as string,
							intention: intention as AnswerIntention,
							doc_count: bucket.doc_count
						});
					}
				});

				defaultValues
					.filter(value =>
						returnValue[bucketInterval.key_as_string].every(
							bucket => bucket.answer_text !== value.key.split('#')[0]
						)
					)
					.forEach(defaultValue => {
						returnValue[bucketInterval.key_as_string].push({
							answer_text: defaultValue.key.split('#')[0],
							intention: 'neutral',
							doc_count: 0
						});
					});

				if (currentBucketTotal !== 0) bucketsAverage.push(currentBucketTotal);
			});

			metadata.average = Number(
				(
					bucketsAverage.reduce((acc, curr) => {
						return acc + curr;
					}, 0) / bucketsAverage.length
				).toFixed(1)
			);

			return { data: returnValue, metadata };
		}),

	getByFieldCodeIntervalAverage: publicProcedure
		.input(
			z.object({
				field_code: z.string(),
				product_id: z.string() /* To change to button_id */,
				start_date: z.string(),
				end_date: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { field_code, product_id, start_date, end_date } = input;

			const product = await ctx.prisma.product.findUnique({
				where: {
					id: parseInt(product_id)
				}
			});

			if (!product) throw new Error('Product not found');
			if (!product.isPublic && !ctx.session?.user)
				throw new Error('Product is not public');

			const nbDays = getDiffDaysBetweenTwoDates(start_date, end_date);

			const fieldCodeIntervalAggs = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				query: {
					bool: {
						must: [
							{
								match: {
									field_code
								}
							},
							{
								match: {
									product_id
								}
							},
							{
								range: {
									created_at: {
										gte: start_date,
										lte: end_date
									}
								}
							}
						]
					}
				},
				aggs: {
					count_per_month: {
						date_histogram: {
							field: 'created_at',
							calendar_interval: getCalendarInterval(nbDays),
							format: getCalendarFormat(nbDays)
						},
						aggs: {
							term: {
								terms: {
									script:
										'doc["answer_text.keyword"].value + "#" + doc["intention.keyword"].value + "#" + doc["field_label.keyword"].value',
									size: 1000
								}
							}
						}
					}
				},
				size: 0
			});

			const tmpBuckets = (
				fieldCodeIntervalAggs?.aggregations?.count_per_month as any
			)?.buckets as BucketsInside;

			let metadata = { total: 0, average: 0 } as {
				total: number;
				average: number;
			};

			let returnValue: Record<string, number> = {};
			let bucketsAverage: number[] = [];

			tmpBuckets.forEach(bucketInterval => {
				let currentBucketMark = 0;
				let currentBucketTotal = 0;

				bucketInterval.term.buckets.forEach(bucket => {
					const [_, intention] = bucket.key.split('#');

					metadata.total += bucket.doc_count;

					currentBucketTotal += bucket.doc_count;
					currentBucketMark +=
						bucket.doc_count *
						(intention === 'good' ? 10 : intention === 'medium' ? 5 : 0);
				});

				let currentBucketAverage =
					Number((currentBucketMark / currentBucketTotal).toFixed(1)) || 0;
				bucketsAverage.push(currentBucketAverage);
				returnValue[bucketInterval.key_as_string] = currentBucketAverage;
			});

			metadata.average = Number(
				(
					bucketsAverage.reduce((acc, curr) => {
						return acc + curr;
					}, 0) / bucketsAverage.length
				).toFixed(1)
			);

			return { data: returnValue, metadata };
		}),

	getObservatoireStats: publicProcedure
		.input(
			z.object({
				product_id: z.string() /* To change to button_id */,
				button_id: z.number().optional(),
				start_date: z.string().optional(),
				end_date: z.string().optional(),
				isXWiki: z.boolean().optional(),
				needLogging: z.boolean().optional().default(false)
			})
		)
		.query(async ({ ctx, input }) => {
			const { product_id, button_id, start_date, end_date, isXWiki } = input;

			const product = await ctx.prisma.product.findUnique({
				where: isXWiki
					? { xwiki_id: parseInt(product_id) }
					: { id: parseInt(product_id) }
			});

			if (!product) throw new Error('Product not found');
			if (!product.isPublic && !ctx.session?.user)
				throw new Error('Product is not public');

			let query: QueryDslQueryContainer = {
				bool: {
					must: [
						{
							terms: {
								field_code: [
									'satisfaction',
									'comprehension',
									'contact_tried',
									'contact_reached',
									'contact_satisfaction'
								]
							}
						},
						{ match: { product_id: product.id } },
						{
							range: {
								created_at: {
									gte: start_date ? start_date : '1970-01-01',
									lte: end_date
										? end_date
										: new Date().toISOString().split('T')[0]
								}
							}
						}
					]
				}
			};

			if (query.bool && query.bool.must) {
				if (button_id) {
					(query.bool.must as QueryDslQueryContainer[]).push({
						match: {
							button_id
						}
					});
				}
			}

			const fieldCodesCounts = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				query: query,
				aggs: {
					count: {
						terms: {
							script:
								'doc["field_code.keyword"].value + "#" + doc["answer_text.keyword"].value + "#" + doc["intention.keyword"].value',
							size: 1000
						}
					}
				}
			});

			const contactTriedUniqueCount = await ctx.elkClient.search<ElkAnswer[]>({
				index: 'jdma-answers',
				query: {
					bool: {
						must: [
							{ match: { field_code: 'contact_tried' } },
							{ match: { product_id: product.id } },
							{
								range: {
									created_at: {
										gte: start_date ? start_date : '1970-01-01',
										lte: end_date
											? end_date
											: new Date().toISOString().split('T')[0]
									}
								}
							}
						]
					}
				},
				aggs: {
					unique_review_ids: {
						cardinality: {
							field: 'review_id'
						}
					}
				}
			});

			const tmpBuckets = (fieldCodesCounts?.aggregations?.count as any)
				?.buckets as BucketsInside;

			const satisfactionMarks = { good: 10, medium: 5 };
			const comprehensionMarks = {
				very_good: 10,
				good: 7.5,
				medium: 5,
				bad: 2.5
			};
			const contactMarks = { very_good: 10, good: 7.5, medium: 5, bad: 2.5 };

			const satisfactionBuckets = tmpBuckets.filter(b =>
				b.key.startsWith('satisfaction#')
			);
			const comprehensionBuckets = tmpBuckets.filter(b =>
				b.key.startsWith('comprehension#')
			);
			const contactBuckets = tmpBuckets.filter(
				b =>
					b.key.startsWith('contact_reached#') ||
					b.key.startsWith('contact_satisfaction#')
			);
			const contactReachabilityBucket = contactBuckets.filter(sb => {
				const [field_code] = sb.key.split('#');
				return field_code === 'contact_reached';
			});
			const contactSatisfactionBucket = contactBuckets.filter(sb => {
				const [field_code] = sb.key.split('#');
				return field_code === 'contact_satisfaction';
			});
			const autonomyBuckets = tmpBuckets.filter(b =>
				b.key.startsWith('contact_tried#')
			);

			const { count: satisfaction_count, average: satisfaction_average } =
				calculateBucketsAverage(satisfactionBuckets, satisfactionMarks);
			const { count: comprehension_count, average: comprehension_average } =
				calculateBucketsAverage(comprehensionBuckets, comprehensionMarks);

			const contactReachability_count = contactReachabilityBucket.reduce(
				(sum, sb) => sum + (sb.doc_count || 0),
				0
			);

			const contactReachability_average =
				contactReachabilityBucket.reduce((sum, sb) => {
					const [, answer_text] = sb.key.split('#');
					return sum + ((answer_text === 'Oui' && sb.doc_count) || 0);
				}, 0) / contactReachability_count;

			const contactSatisfaction_count = contactSatisfactionBucket.reduce(
				(sum, sb) => sum + sb.doc_count,
				0
			);
			const contactSatisfaction_average =
				contactSatisfactionBucket.reduce((sum, sb) => {
					const [, , intention] = sb.key.split('#');
					return sum + ((contactMarks as any)[intention] || 0) * sb.doc_count;
				}, 0) / contactSatisfaction_count;

			const contact_count = contactBuckets.reduce((sum, sb) => {
				const [field_code, answer_text] = sb.key.split('#');
				if (
					field_code === 'contact_satisfaction' ||
					(field_code === 'contact_reached' && answer_text === 'Non')
				)
					return sum + sb.doc_count;
				return sum;
			}, 0);

			const contact_average =
				contactBuckets.reduce((sum, sb) => {
					const [field_code, , intention] = sb.key.split('#');
					return (
						sum +
						((field_code === 'contact_satisfaction' &&
							(contactMarks as any)[intention]) ||
							0) *
							sb.doc_count
					);
				}, 0) / contact_count;

			const autonomy_count = (contactTriedUniqueCount.aggregations as any)
				.unique_review_ids.value;
			const autonomy_average =
				autonomyBuckets.reduce((sum, sb) => {
					const [, , intention] = sb.key.split('#');
					if (intention === 'good') return sum + 10 * sb.doc_count;

					return sum;
				}, 0) / autonomy_count;

			const returnValue = {
				satisfaction: satisfaction_average,
				comprehension: comprehension_average,
				contact: isNaN(contact_average) ? 0 : contact_average,
				contact_reachability: isNaN(contactReachability_average)
					? 0
					: contactReachability_average,
				contact_satisfaction: isNaN(contactSatisfaction_average)
					? 0
					: contactSatisfaction_average,
				autonomy: isNaN(autonomy_average) ? 0 : autonomy_average
			};

			const metadata = {
				satisfaction_count,
				comprehension_count,
				contact_count,
				contactReachability_count,
				contactSatisfaction_count,
				autonomy_count
			};

			if (input.needLogging) {
				const user = ctx.session?.user;
				if (user) {
					await ctx.prisma.userEvent.create({
						data: {
							user_id: parseInt(user.id),
							action: 'service_stats_view',
							product_id: parseInt(product_id),
							metadata: input
						}
					});
				}
			}

			return { data: returnValue, metadata };
		})
});
