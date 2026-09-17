import { selectors } from '../../../utils/selectors';
import { login } from '../../../utils/helpers/common';
import { appUrl } from '../../../utils/variables';

type OutsiderCtx = {
	user_id: number;
	user_email: string;
	foreign_entity_id: number;
	foreign_product_id: number;
};

type ApiKeyRightsCtx = {
	entity_id: number;
	product_id: number;
	carrier_user_email: string;
	carrier_admin_email: string;
	entity_admin_email: string;
	user_ids: number[];
};

const OUTSIDER_PASSWORD = 'OutsiderPass2026@!';
const RIGHTS_PASSWORD = 'RightsPass2026@!';

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

describe("Qui a droit aux clés d'API d'un service", () => {
	let ctx: ApiKeyRightsCtx;

	const apiKeysUrl = () =>
		`${appUrl}/administration/dashboard/product/${ctx.product_id}/api_keys`;
	const formsUrl = () =>
		`${appUrl}/administration/dashboard/product/${ctx.product_id}/forms`;

	before(() => {
		cy.task<ApiKeyRightsCtx>('db:setupApiKeyRightsCtx', {
			password: RIGHTS_PASSWORD
		}).then(c => {
			ctx = c;
		});
	});

	after(() => cy.task('db:cleanupApiKeyRightsCtx', ctx));

	describe('Utilisateur du service numérique', () => {
		beforeEach(() => login(ctx.carrier_user_email, RIGHTS_PASSWORD));

		it('ne peut pas lister les clés', () => {
			trpcQuery('apiKey.getList', { product_id: ctx.product_id })
				.its('status')
				.should('eq', 401);
		});

		it('ne peut pas créer de clé', () => {
			trpcMutation('apiKey.create', { product_id: ctx.product_id })
				.its('status')
				.should('eq', 401);

			cy.task('db:countApiKeys', { product_id: ctx.product_id }).should(
				'eq',
				0
			);
		});

		it("ne voit pas l'onglet « Clés API »", () => {
			cy.visit(formsUrl());
			cy.get(selectors.sideMenu.menu).should('be.visible');
			cy.get(
				`.fr-sidemenu__link[href="/administration/dashboard/product/${ctx.product_id}/api_keys"]`
			).should('not.exist');
		});

		it("est redirigé s'il ouvre l'URL des clés directement", () => {
			cy.visit(apiKeysUrl());
			cy.url().should('eq', formsUrl());
		});
	});

	describe('Administrateur du service numérique', () => {
		beforeEach(() => login(ctx.carrier_admin_email, RIGHTS_PASSWORD));

		it('peut lister et créer une clé', () => {
			trpcQuery('apiKey.getList', { product_id: ctx.product_id })
				.its('status')
				.should('eq', 200);

			trpcMutation('apiKey.create', { product_id: ctx.product_id })
				.its('status')
				.should('eq', 200);

			cy.task('db:countApiKeys', { product_id: ctx.product_id }).should(
				'eq',
				1
			);
		});

		it("voit l'onglet « Clés API »", () => {
			cy.visit(formsUrl());
			cy.get(
				`.fr-sidemenu__link[href="/administration/dashboard/product/${ctx.product_id}/api_keys"]`
			).should('exist');
		});
	});

	describe("Administrateur d'organisation", () => {
		beforeEach(() => login(ctx.entity_admin_email, RIGHTS_PASSWORD));

		it('peut créer une clé puis la voir dans le listing', () => {
			trpcMutation('apiKey.create', { product_id: ctx.product_id })
				.its('status')
				.should('eq', 200);

			trpcQuery('apiKey.getList', { product_id: ctx.product_id }).then(
				response => {
					expect(response.status).to.eq(200);
					expect(response.body[0].result.data.json.data).to.have.length.above(
						0
					);
				}
			);
		});
	});
});
