import { login } from '../../../utils/helpers/common';
import { selectors } from '../../../utils/selectors';
import { adminEmail, adminPassword, appUrl } from '../../../utils/variables';

describe('jdma-answer-check', () => {
	beforeEach(() => {
		login(adminEmail, adminPassword);
	});

	it('should the test answer exist', () => {
		cy.get('span.fr-text--bold')
			.invoke('text')
			.then(text => {
				const value = parseInt(text);
				expect(value).to.not.equal(0);
			});
	});

	it('should make the form stats public', () => {
		cy.visit(
			appUrl + '/administration/dashboard/product/2/forms/2?tab=settings'
		);
		cy.get('button[role="tab"]').contains('Paramètres').click();
		cy.get('fieldset.fr-fieldset')
			.contains('legend', 'Définir la visibilité des statistiques')
			.should('exist');
		cy.get('.fr-radio-group').contains('label', 'Publique').click();
		cy.get('a[href="/public/form/2/stats"]')
			.should('be.visible')
			.and('contain', 'Voir la page publique');
		cy.visit(appUrl + '/public/form/2/stats');
		cy.get('h1').contains(selectors.dashboard.nameTestService);
	});

	it('should make the form stats private again', () => {
		cy.visit(
			appUrl + '/administration/dashboard/product/2/forms/2?tab=settings'
		);
		cy.get('button[role="tab"]').contains('Paramètres').click();
		cy.get('.fr-radio-group').contains('label', 'Privé').click();
		cy.get('a[href="/public/form/2/stats"]').should('not.exist');
		cy.visit(appUrl + '/public/form/2/stats');
		cy.get('h1').contains('Statistiques');
		cy.contains(
			"Ce formulaire n'existe pas ou ses statistiques ne sont pas publiques"
		);
	});
});
