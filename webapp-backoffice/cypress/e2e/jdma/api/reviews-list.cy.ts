type Ctx = {
	entity_id: number;
	product_ids: number[];
	form_id: number;
	button_id: number;
	api_key: string;
	api_key_id: number;
	user_id: number;
};

const ANCHOR = '2026-01-15T12:00:00.000Z';

const makeReview = (ctx: Ctx, dayOffset: number, slug: 'root' | 'bug') => ({
	form_id: ctx.form_id,
	product_id: ctx.product_ids[0],
	button_id: ctx.button_id,
	created_at: new Date(
		Date.parse(ANCHOR) + dayOffset * 86_400_000
	).toISOString(),
	answers:
		slug === 'bug'
			? [
					{
						field_code: 'bug_kind',
						field_label: 'Type de retour',
						answer_text: 'BUG',
						answer_item_id: 1,
						kind: 'radio' as const
					},
					{
						field_code: 'verbatim',
						field_label: 'Pouvez-vous nous en dire plus ?',
						answer_text: `Bug ${dayOffset}`,
						kind: 'text' as const
					}
			  ]
			: [
					{
						field_code: 'satisfaction',
						field_label: 'Satisfaction',
						answer_text: 'good',
						answer_item_id: 4,
						intention: 'good' as const,
						kind: 'radio' as const
					}
			  ]
});

const apiRequest = (
	apiKey: string | null,
	qs: Record<string, string | number>
) =>
	cy.request({
		method: 'GET',
		url: '/api/open-api/reviews',
		qs,
		headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
		failOnStatusCode: false
	});

describe('OpenAPI GET /reviews', () => {
	it('documents the endpoint in the OpenAPI spec', () => {
		cy.request('/api/open-api').then(res => {
			expect(res.status).to.eq(200);
			expect(res.body.paths).to.have.property('/reviews');
			expect(res.body.paths['/reviews']).to.have.property('get');
		});
	});

	it('refuses requests without API key', () => {
		apiRequest(null, { form_id: 1 }).its('status').should('eq', 401);
	});

	it('refuses unknown API key', () => {
		apiRequest('definitely-not-a-key', { form_id: 1 })
			.its('status')
			.should('eq', 401);
	});

	describe('happy path on form bug', () => {
		let ctx: Ctx;

		before(() => {
			cy.task<Ctx>('db:setupApiCtx', {
				template_slug: 'bug',
				api_scope: 'product'
			}).then(c => {
				ctx = c;
				cy.task('db:seedReviews', [
					makeReview(ctx, 0, 'bug'),
					makeReview(ctx, -1, 'bug'),
					makeReview(ctx, -2, 'bug')
				]);
			});
		});

		after(() => cy.task('db:cleanupApiCtx', ctx));

		it('returns the seeded reviews with form_template_slug=bug', () => {
			apiRequest(ctx.api_key, { form_id: ctx.form_id }).then(res => {
				expect(res.status).to.eq(200);
				expect(res.body.data).to.have.length(3);
				res.body.data.forEach((r: any) => {
					expect(r.form_template_slug).to.eq('bug');
					expect(r.product_id).to.eq(ctx.product_ids[0]);
					expect(r.answers).to.exist;
					expect(r.answers.length).to.be.greaterThan(0);
				});
				expect(res.body.metadata.has_more).to.eq(false);
				expect(res.body.metadata.next_cursor).to.eq(null);
			});
		});

		it('omits answers when include_answers=false', () => {
			apiRequest(ctx.api_key, {
				form_id: ctx.form_id,
				include_answers: 'false'
			}).then(res => {
				expect(res.status).to.eq(200);
				res.body.data.forEach((r: any) => expect(r.answers).to.eq(undefined));
			});
		});
	});

	describe('pagination cursor', () => {
		let ctx: Ctx;

		before(() => {
			cy.task<Ctx>('db:setupApiCtx', {
				template_slug: 'bug',
				api_scope: 'product'
			}).then(c => {
				ctx = c;
				const reviews = Array.from({ length: 7 }, (_, i) =>
					makeReview(ctx, -i, 'bug')
				);
				cy.task('db:seedReviews', reviews);
			});
		});

		after(() => cy.task('db:cleanupApiCtx', ctx));

		it('paginates with stable order and exposes next_cursor', () => {
			const collected: number[] = [];
			apiRequest(ctx.api_key, { form_id: ctx.form_id, limit: 3 }).then(p1 => {
				expect(p1.status).to.eq(200);
				expect(p1.body.data).to.have.length(3);
				expect(p1.body.metadata.has_more).to.eq(true);
				collected.push(...p1.body.data.map((r: any) => r.id));

				apiRequest(ctx.api_key, {
					form_id: ctx.form_id,
					limit: 3,
					cursor: p1.body.metadata.next_cursor
				}).then(p2 => {
					expect(p2.status).to.eq(200);
					expect(p2.body.data).to.have.length(3);
					collected.push(...p2.body.data.map((r: any) => r.id));

					apiRequest(ctx.api_key, {
						form_id: ctx.form_id,
						limit: 3,
						cursor: p2.body.metadata.next_cursor
					}).then(p3 => {
						expect(p3.status).to.eq(200);
						expect(p3.body.data).to.have.length(1);
						expect(p3.body.metadata.has_more).to.eq(false);
						expect(p3.body.metadata.next_cursor).to.eq(null);
						collected.push(...p3.body.data.map((r: any) => r.id));

						expect(new Set(collected).size).to.eq(7);
					});
				});
			});
		});

		it('rejects malformed cursor with 400', () => {
			apiRequest(ctx.api_key, {
				form_id: ctx.form_id,
				cursor: 'not-base64-json'
			})
				.its('status')
				.should('eq', 400);
		});

		it('forged cursor cannot bypass start_date filter', () => {
			const future = '2099-01-01';
			const raw = JSON.stringify({
				ts: '2000-01-01T00:00:00.000Z',
				id: 99999
			});
			const forged = btoa(raw)
				.replace(/\+/g, '-')
				.replace(/\//g, '_')
				.replace(/=+$/, '');
			apiRequest(ctx.api_key, {
				form_id: ctx.form_id,
				start_date: future,
				end_date: future,
				cursor: forged
			}).then(res => {
				expect(res.status).to.eq(200);
				expect(res.body.data).to.have.length(0);
			});
		});
	});

	describe('access control', () => {
		let owner: Ctx;
		let intruder: Ctx;

		before(() => {
			cy.task<Ctx>('db:setupApiCtx', {
				template_slug: 'root',
				api_scope: 'product'
			}).then(c => (owner = c));
			cy.task<Ctx>('db:setupApiCtx', {
				template_slug: 'root',
				api_scope: 'product'
			}).then(c => (intruder = c));
		});

		after(() => {
			cy.task('db:cleanupApiCtx', owner);
			cy.task('db:cleanupApiCtx', intruder);
		});

		it('returns 404 (anti-enumeration) when accessing another tenant form', () => {
			apiRequest(intruder.api_key, { form_id: owner.form_id })
				.its('status')
				.should('eq', 404);
		});

		it('returns 404 on unknown form id', () => {
			apiRequest(owner.api_key, { form_id: 999_999_999 })
				.its('status')
				.should('eq', 404);
		});

		it('blocks legacy form ids 1/2 for non admins', () => {
			apiRequest(owner.api_key, { form_id: 1 }).its('status').should('eq', 404);
			apiRequest(owner.api_key, { form_id: 2 }).its('status').should('eq', 404);
		});

		it('rejects incoherent product_id', () => {
			apiRequest(owner.api_key, {
				form_id: owner.form_id,
				product_id: owner.product_ids[0] + 999_999
			})
				.its('status')
				.should('eq', 400);
		});
	});

	describe('input validation', () => {
		let ctx: Ctx;
		before(() =>
			cy
				.task<Ctx>('db:setupApiCtx', {
					template_slug: 'bug',
					api_scope: 'product'
				})
				.then(c => (ctx = c))
		);
		after(() => cy.task('db:cleanupApiCtx', ctx));

		it('rejects malformed date', () => {
			apiRequest(ctx.api_key, {
				form_id: ctx.form_id,
				start_date: '2026-13-40'
			})
				.its('status')
				.should('eq', 400);
		});

		it('rejects inverted date range', () => {
			apiRequest(ctx.api_key, {
				form_id: ctx.form_id,
				start_date: '2026-12-31',
				end_date: '2026-01-01'
			})
				.its('status')
				.should('eq', 400);
		});

		it('rejects deleted form with 404', () => {
			cy.task('db:markFormDeleted', ctx.form_id);
			apiRequest(ctx.api_key, { form_id: ctx.form_id })
				.its('status')
				.should('eq', 404);
		});
	});
});
