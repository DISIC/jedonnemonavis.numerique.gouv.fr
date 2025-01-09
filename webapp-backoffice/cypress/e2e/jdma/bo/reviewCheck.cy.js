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

	it('should navigate to the product stats page and verify the review count matching the review count in the dashboard page', () => {
		cy.visit(`${app_url}/administration/dashboard/product/5/stats`);
		cy.get('div.fr-tile')
			.find('h3.fr-tile__title')
			.contains('Avis')
			.siblings('p')
			.then($el => {
				const text = $el.text();
				const value = parseInt(text);
				expect(value).to.be.equal(2);
			});
	});

	it('should navigate to the review page and find the verbatim in the created review', () => {
		cy.visit(`${app_url}/administration/dashboard/product/5/reviews`);
		cy.get('.fr-btn').contains("Plus d'infos").click();
		cy.get('h2')
			.contains('Souhaitez-vous nous en dire plus ?')
			.next('p')
			.should('contain', 'e2e test content');
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
