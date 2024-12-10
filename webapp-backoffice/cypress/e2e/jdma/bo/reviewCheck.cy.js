const app_url = Cypress.env('app_base_url');
const invitedEmail = Cypress.env('admin_user_mail');
const userPassword = Cypress.env('admin_user_password');
const productId = 5;

describe('jdma-answer-check', () => {
	beforeEach(() => {
		loginAndNavigate();
	});

	it('should find a review count start at 1 and get incremented by 1', () => {
		cy.get('a[href*="/administration/dashboard/product/5/stats"]')
			.find('div.fr-label--info.fr-text--bold')
			.then($el => {
				const text = $el.text();
				const value = parseInt(text);
				expect(value).to.be.equal(1);
			});
		cy.submitCompleteReview().then(() => {
			cy.visit(`${app_url}/administration/dashboard/products`);
			cy.wait(8000);
			cy.get('a[href*="/administration/dashboard/product/5/stats"]')
				.find('div.fr-label--info.fr-text--bold')
				.then($el => {
					const text = $el.text();
					const value = parseInt(text);
					expect(value).to.be.equal(2);
				});
		});
	});
});

function loginAndNavigate() {
	cy.visit(app_url);
	cy.get('header')
		.find('.fr-header__tools')
		.contains('Connexion / Inscription')
		.click();
	cy.url()
		.should('eq', app_url + '/login')
		.then(() => {
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
		});
}
