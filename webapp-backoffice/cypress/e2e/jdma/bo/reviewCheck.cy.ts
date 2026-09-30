import { login } from '../../../utils/helpers/common';
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
		cy.intercept('POST', '**/form.setVisibility**').as('setVisibility');
		cy.visit(
			appUrl + '/administration/dashboard/product/1/forms/2?tab=settings'
		);
		cy.get('fieldset.fr-fieldset')
			.contains('legend', 'Définir la visibilité des statistiques')
			.should('exist');
		cy.get('.fr-breadcrumb a[href$="/forms"]')
			.invoke('text')
			.then(serviceTitle => {
				cy.get('.fr-radio-group').contains('label', 'Public').click();
				cy.wait('@setVisibility').its('response.statusCode').should('eq', 200);
				cy.get('a[href="/public/form/2/stats"]')
					.should('be.visible')
					.and('contain', 'Voir la page publique');
				cy.visit(appUrl + '/public/form/2/stats');
				cy.get('h1').should('contain', serviceTitle.trim());
			});
	});

	it('should make the form stats private again', () => {
		cy.intercept('POST', '**/form.setVisibility**').as('setVisibility');
		cy.visit(
			appUrl + '/administration/dashboard/product/1/forms/2?tab=settings'
		);
		cy.get('fieldset.fr-fieldset')
			.contains('legend', 'Définir la visibilité des statistiques')
			.should('exist');
		cy.get('a[href="/public/form/2/stats"]').should('exist');
		cy.get('.fr-radio-group').contains('label', 'Privé').click();
		cy.wait('@setVisibility').its('response.statusCode').should('eq', 200);
		cy.get('a[href="/public/form/2/stats"]').should('not.exist');
		cy.request({
			url: appUrl + '/public/form/2/stats',
			failOnStatusCode: false
		})
			.its('status')
			.should('eq', 404);
		cy.visit(appUrl + '/public/form/2/stats', { failOnStatusCode: false });
		cy.get('h1').should('contain', 'Page non trouvée');
		cy.contains('Erreur 404');
	});
});