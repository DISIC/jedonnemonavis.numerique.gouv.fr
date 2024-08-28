const app_url = Cypress.env('app_base_url');
const invitedEmail = 'e2e-jdma-test-invite@beta.gouv.fr';
const userPassword = Cypress.env('user_password');

describe('jdma-answer-check', () => {
	beforeEach(() => {
		cy.visit(app_url);
	});

	it('should the test answer exist', () => {
		cy.get('header')
			.find('.fr-header__tools')
			.contains('Connexion / Inscription')
			.click();
		cy.url().should('eq', app_url + '/login');
		cy.wait(5000);

		cy.get('input[name="email"]').type(invitedEmail);
		cy.get('[class*="LoginForm-button"]')
			.contains('Continuer')
			.click()
			.then(() => {
				cy.wait(1000);
				cy.get('input[type="password"]').type(userPassword);
			});
		cy.get('[class*="LoginForm-button"]')
			.contains('Confirmer')
			.click()
			.then(() => {
				cy.url().should('eq', app_url + '/administration/dashboard/products');
			});
		cy.get('p.fr-badge.fr-badge--info')
			.invoke('text')
			.then(text => {
				const value = parseInt(text);
				expect(value).to.not.equal(0);
			});
		deleteTestUsers();
	});
});

function deleteTestUsers() {
	cy.request({
		method: 'DELETE',
		url: '/api/cypress-test/deleteUsersAndProduct',
		failOnStatusCode: false
	}).then(response => {
		cy.log(response.body.message);
	});
}
