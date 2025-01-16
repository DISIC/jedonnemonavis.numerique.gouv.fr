const app_url = Cypress.env('app_base_url');
const invitedEmail = Cypress.env('admin_user_mail');
const userPassword = Cypress.env('admin_user_password');

describe('jdma-answer-check', () => {
	beforeEach(() => {
		loginAndNavigate();
	});

	it('should the test answer exist', () => {
		cy.get('div.fr-label--info.fr-text--bold')
			.invoke('text')
			.then(text => {
				const value = parseInt(text);
				expect(value).to.not.equal(0);
			});
	});

	it('should activate the stats public page', () => {
		cy.get('a[href*="/administration/dashboard/product/5/stats"]')
			.click()
			.then(() => {
				cy.get('button')
					.contains('Rendre ces statistiques publiques')
					.click()
					.then(() => {
						cy.get('.fr-toggle__label')
							.click()
							.then(() => {
								cy.get('a[href="/public/product/5/stats"]').then($link => {
									const url = $link.prop('href');
									expect(url).to.contain('/public/product/5/stats');
									cy.get('a[href="/public/product/5/stats"]')
										.click()
										.then(() => {
											cy.get('h1').contains('e2e-jdma-service-test-1');
										});
								});
							});
					});
			});
	});

	it('should deactivate the stats public page', () => {
		cy.get('a[href*="/administration/dashboard/product/5/stats"]')
			.click()
			.then(() => {
				cy.get('button')
					.contains('Rendre ces statistiques publiques')
					.click()
					.then(() => {
						cy.get('.fr-toggle__label')
							.click()
							.then(() => {
								cy.get('a[href="/public/product/5/stats"]').should('not.exist');
							});
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
					cy.wait(8000);
				});
		});
}
