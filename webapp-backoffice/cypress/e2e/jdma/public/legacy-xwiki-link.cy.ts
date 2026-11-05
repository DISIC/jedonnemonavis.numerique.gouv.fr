import { appFormUrl } from '../../../utils/variables';

type LegacyXwikiCtx = {
	entity_id: number;
	product_id: number;
	xwiki_id: number;
	root_form_id: number;
	bug_form_id: number;
	button_id: number;
};

describe('jdma-legacy-xwiki-link', () => {
	let ctx: LegacyXwikiCtx;

	before(() => {
		cy.task<LegacyXwikiCtx>('db:setupLegacyXwikiCtx').then(c => {
			ctx = c;
		});
	});

	after(() => {
		cy.task('db:cleanupLegacyXwikiCtx', ctx);
	});

	it("ouvre le formulaire d'avis quand le service porte aussi un formulaire de remontées", () => {
		cy.visit(
			`${appFormUrl}/Demarches/${ctx.xwiki_id}?nd_source=button&key=e2e-legacy-key`,
			{ failOnStatusCode: false }
		);
		cy.contains('h1', 'Je donne mon avis').should('exist');
		cy.contains('h1', 'Formulaire non trouvé').should('not.exist');
	});

	it("ouvre le formulaire d'avis avec le lien d'intégration courant", () => {
		cy.visit(
			`${appFormUrl}/Demarches/${ctx.product_id}?button=${ctx.button_id}`,
			{ failOnStatusCode: false }
		);
		cy.contains('h1', 'Je donne mon avis').should('exist');
	});
});
