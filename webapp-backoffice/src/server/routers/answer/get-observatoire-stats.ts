import type { Context } from '@/src/server/trpc';
import { calculateBucketsAverage } from '@/src/utils/tools';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { z } from 'zod';
import { BucketsInside, ElkAnswer } from '../../../types/custom';

export const getObservatoireStatsInputSchema = z.object({
	product_id: z.number(),
	form_id: z.number().optional(),
	button_id: z.number().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	isXWiki: z.boolean().optional(),
	needLogging: z.boolean().optional().default(false)
});

export const getObservatoireStatsQuery = async ({
	ctx,
	input
}: {
	ctx: Context;
	input: z.infer<typeof getObservatoireStatsInputSchema>;
}) => {
	const { product_id, form_id, button_id, start_date, end_date, isXWiki } =
		input;

	const product = await ctx.prisma.product.findUnique({
		where: isXWiki ? { xwiki_id: product_id } : { id: product_id },
		include: {
			forms: {
				where: {
					legacy: true
				}
			}
		}
	});

	if (!product) throw new Error('Product not found');
	if (!product.isPublic && !ctx.session?.user)
		throw new Error('Product is not public');

	if (!form_id && !product.forms[0].id) throw new Error('No form specified');

	const form = await ctx.prisma.form.findUnique({
		where: { id: form_id ? form_id : product?.forms[0].id }
	});

	if (!form) throw new Error('Form not found');

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
				{
					match: {
						product_id: product.id
					}
				},
				{
					range: {
						created_at: {
							gte: start_date ? start_date : '1970-01-01',
							lte: end_date ? end_date : new Date().toISOString().split('T')[0]
						}
					}
				},
				form.legacy
					? {
							bool: {
								should: [
									{ terms: { form_id: [form.id, 1, 2] } },
									{ bool: { must_not: { exists: { field: 'form_id' } } } }
								],
								minimum_should_match: 1
							}
					  }
					: {
							term: {
								form_id: form.id
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
					},
					form.legacy
						? {
								bool: {
									should: [
										{ terms: { form_id: [form.id, 1, 2] } },
										{ bool: { must_not: { exists: { field: 'form_id' } } } }
									],
									minimum_should_match: 1
								}
						  }
						: {
								term: {
									form_id: form.id
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
					product_id: product_id,
					metadata: input
				}
			});
		}
	}

	return { data: returnValue, metadata };
};
