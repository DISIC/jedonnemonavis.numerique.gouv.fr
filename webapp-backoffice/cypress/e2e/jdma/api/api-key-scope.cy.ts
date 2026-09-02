import { login } from '../../../utils/helpers/common';

type OutsiderCtx = {
	user_id: number;
	user_email: string;
	foreign_entity_id: number;
	foreign_product_id: number;
};

const OUTSIDER_PASSWORD = 'OutsiderPass2026@!';

// Le client tRPC de l'application passe par httpBatchLink + SuperJSON : on
// reproduit le même format pour attaquer la procédure directement, sans passer
// par l'interface.
const trpcMutation = (procedure: string, input: Record<string, unknown>) =>
	cy.request({
		method: 'POST',
		url: `/api/trpc/${procedure}?batch=1`,
		body: { 0: { json: input } },
		failOnStatusCode: false
	});

const trpcQuery = (procedure: string, input: Record<string, unknown>) =>
	cy.request({
		method: 'GET',
		url: `/api/trpc/${procedure}?batch=1&input=${encodeURIComponent(
			JSON.stringify({ 0: { json: input } })
		)}`,
		failOnStatusCode: false
	});

describe("Périmètre des clés d'API", () => {
	let ctx: OutsiderCtx;

	before(() => {
		cy.task<OutsiderCtx>('db:setupOutsiderCtx', {
			password: OUTSIDER_PASSWORD
		}).then(c => {
			ctx = c;
		});
	});

	// L'isolation des tests remet les cookies à zéro entre chaque `it`, donc la
	// connexion se refait à chaque fois — comme dans tous les autres specs.
	beforeEach(() => {
		login(ctx.user_email, OUTSIDER_PASSWORD);
	});

	after(() => cy.task('db:cleanupOutsiderCtx', ctx));

	it("refuse de créer une clé sur un service dont l'utilisateur n'est pas porteur", () => {
		trpcMutation('apiKey.create', {
			product_id: ctx.foreign_product_id
		})
			.its('status')
			.should('eq', 401);

		cy.task('db:countApiKeys', { product_id: ctx.foreign_product_id }).should(
			'eq',
			0
		);
	});

	it("refuse de créer une clé sur une entité dont l'utilisateur n'est pas administrateur", () => {
		trpcMutation('apiKey.create', {
			entity_id: ctx.foreign_entity_id
		})
			.its('status')
			.should('eq', 401);

		cy.task('db:countApiKeys', { entity_id: ctx.foreign_entity_id }).should(
			'eq',
			0
		);
	});

	it('refuse de créer une clé sans périmètre', () => {
		trpcMutation('apiKey.create', {}).its('status').should('eq', 400);
	});

	it("refuse de lister les clés d'un service dont l'utilisateur n'est pas porteur", () => {
		trpcQuery('apiKey.getList', { product_id: ctx.foreign_product_id })
			.its('status')
			.should('eq', 401);
	});

	// Contrôle positif : sans lui, un garde-fou qui refuserait tout ferait passer
	// les quatre tests ci-dessus.
	it('autorise la création une fois le droit de porteur accordé', () => {
		cy.task('db:grantCarrierAdmin', {
			user_email: ctx.user_email,
			product_id: ctx.foreign_product_id
		});

		trpcMutation('apiKey.create', {
			product_id: ctx.foreign_product_id
		})
			.its('status')
			.should('eq', 200);

		cy.task('db:countApiKeys', { product_id: ctx.foreign_product_id }).should(
			'eq',
			1
		);
	});
});
