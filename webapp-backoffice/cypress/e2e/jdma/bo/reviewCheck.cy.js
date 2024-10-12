const app_url = Cypress.env('app_base_url');
const invitedEmail = Cypress.env('admin_guest_mail_bis');
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
		cy.wait(8000);
		cy.get('div.fr-label--info.fr-text--bold')
			.invoke('text')
			.then(text => {
				const value = parseInt(text);
				expect(value).to.not.equal(0);
			});
	});
});
