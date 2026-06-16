import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

type SeedReviewArg = {
	form_id: number;
	product_id: number;
	button_id: number;
	created_at: string;
	answers?: Array<{
		field_code: string;
		field_label: string;
		answer_text: string;
		answer_item_id?: number;
		intention?:
			| 'very_good'
			| 'good'
			| 'medium'
			| 'bad'
			| 'very_bad'
			| 'neutral'
			| null;
		kind?: 'text' | 'checkbox' | 'radio';
		parent_field_code?: string;
	}>;
};

type SetupCtxArg = {
	template_slug: 'root' | 'bug';
	api_scope?: 'admin' | 'product' | 'entity' | 'none';
	entity_products?: number;
};

type Ctx = {
	entity_id: number;
	product_ids: number[];
	form_id: number;
	button_id: number;
	api_key: string;
	api_key_id: number;
	user_id: number;
};

export const dbTasks = {
	'db:setupApiCtx': async (arg: SetupCtxArg): Promise<Ctx> => {
		const suffix = crypto.randomBytes(4).toString('hex');
		const tpl = await prisma.formTemplate.findUniqueOrThrow({
			where: { slug: arg.template_slug }
		});
		const user = await prisma.user.create({
			data: {
				email: `api-test-${suffix}@example.org`,
				firstName: 'Api',
				lastName: 'Test',
				password: 'unused',
				role: 'user',
				active: true
			}
		});
		const entity = await prisma.entity.create({
			data: { name: `E-${suffix}`, acronym: `E${suffix}` }
		});
		const productCount = Math.max(1, arg.entity_products ?? 1);
		const products = await Promise.all(
			Array.from({ length: productCount }, (_, i) =>
				prisma.product.create({
					data: {
						title: `P-${suffix}-${i}`,
						entity_id: entity.id,
						isPublic: true
					}
				})
			)
		);
		const form = await prisma.form.create({
			data: {
				title: `F-${suffix}`,
				form_template_id: tpl.id,
				product_id: products[0].id,
				user_id: user.id
			}
		});
		const button = await prisma.button.create({
			data: {
				title: `B-${suffix}`,
				form_id: form.id,
				isTest: false
			}
		});

		const apiKey = `test-${suffix}-${crypto.randomBytes(12).toString('hex')}`;
		const scope = arg.api_scope ?? 'product';
		const created = await prisma.apiKey.create({
			data: {
				key: apiKey,
				scope: scope === 'admin' ? 'admin' : 'user',
				user_id: user.id,
				product_id: scope === 'product' ? products[0].id : null,
				entity_id: scope === 'entity' ? entity.id : null
			}
		});

		return {
			entity_id: entity.id,
			product_ids: products.map(p => p.id),
			form_id: form.id,
			button_id: button.id,
			api_key: apiKey,
			api_key_id: created.id,
			user_id: user.id
		};
	},

	'db:seedReviews': async (
		args: SeedReviewArg[]
	): Promise<Array<{ id: number; created_at: string }>> => {
		const out: Array<{ id: number; created_at: string }> = [];
		for (const a of args) {
			const review = await prisma.review.create({
				data: {
					form_id: a.form_id,
					product_id: a.product_id,
					button_id: a.button_id,
					created_at: new Date(a.created_at),
					has_verbatim: (a.answers ?? []).some(
						ans => ans.field_code === 'verbatim'
					)
				}
			});
			const parentMap = new Map<string, number>();
			for (const ans of a.answers ?? []) {
				const created = await prisma.answer.create({
					data: {
						review_id: review.id,
						review_created_at: review.created_at,
						created_at: review.created_at,
						field_code: ans.field_code,
						field_label: ans.field_label,
						answer_text: ans.answer_text,
						answer_item_id: ans.answer_item_id ?? 0,
						kind: ans.kind ?? 'text',
						intention: ans.intention ?? null,
						parent_answer_id: ans.parent_field_code
							? parentMap.get(ans.parent_field_code) ?? null
							: null
					}
				});
				parentMap.set(ans.field_code, created.id);
			}
			out.push({ id: review.id, created_at: review.created_at.toISOString() });
		}
		return out;
	},

	'db:cleanupApiCtx': async (ctx: Ctx): Promise<null> => {
		await prisma.apiKeyLog.deleteMany({ where: { apikey_id: ctx.api_key_id } });
		await prisma.apiKey.deleteMany({ where: { id: ctx.api_key_id } });
		await prisma.answer.deleteMany({
			where: { review: { product_id: { in: ctx.product_ids } } }
		});
		await prisma.review.deleteMany({
			where: { product_id: { in: ctx.product_ids } }
		});
		await prisma.button.deleteMany({ where: { id: ctx.button_id } });
		await prisma.form.deleteMany({ where: { id: ctx.form_id } });
		await prisma.product.deleteMany({ where: { id: { in: ctx.product_ids } } });
		await prisma.entity.deleteMany({ where: { id: ctx.entity_id } });
		await prisma.user.deleteMany({ where: { id: ctx.user_id } });
		return null;
	},

	'db:markFormDeleted': async (form_id: number): Promise<null> => {
		await prisma.form.update({
			where: { id: form_id },
			data: { deleted_at: new Date(), isDeleted: true }
		});
		return null;
	}
};
