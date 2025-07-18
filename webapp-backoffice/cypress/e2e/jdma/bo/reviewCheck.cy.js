const app_url = Cypress.env('app_base_url');
const invitedEmail = Cypress.env('admin_user_mail');
const userPassword = Cypress.env('admin_user_password');

describe('jdma-answer-check', () => {
	beforeEach(() => {
		loginAndNavigate();
	});

	it('should the test answer exist', () => {
		cy.get('span.fr-text--bold')
			.invoke('text')
			.then(text => {
				const value = parseInt(text);
				expect(value).to.not.equal(0);
			});
	});

	// TODO : change to test on product side
	// it('should activate the stats public page', () => {
	// 	cy.get('a[href*="/administration/dashboard/product/2/forms/2"]')
	// 		.click()
	// 		.then(() => {
	// 			cy.wait(5000);
	// 			cy.get('button').contains('Statistiques').click();
	// 			cy.wait(1000);
	// 			cy.get('button')
	// 				.contains('Rendre ces statistiques publiques')
	// 				.first()
	// 				.click()
	// 				.then(() => {
	// 					cy.get('.fr-toggle__label')
	// 						.first()
	// 						.click()
	// 						.then(() => {
	// 							cy.get('a[href="/public/product/2/stats"]').then($link => {
	// 								const url = $link.prop('href');
	// 								expect(url).to.contain('/public/product/2/stats');
	// 								cy.get('a[href="/public/product/2/stats"]')
	// 									.click()
	// 									.then(() => {
	// 										cy.get('h1').contains('e2e-jdma-service-test-1');
	// 									});
	// 							});
	// 						});
	// 				});
	// 		});
	// });

	// it('should deactivate the stats public page', () => {
	// 	cy.get('a[href*="/administration/dashboard/product/2/forms/2"]')
	// 		.click()
	// 		.then(() => {
	// 			cy.wait(5000);
	// 			cy.get('button').contains('Statistiques').click();
	// 			cy.wait(1000);
	// 			cy.get('button')
	// 				.contains('Rendre ces statistiques publiques')
	// 				.first()
	// 				.click()
	// 				.then(() => {
	// 					cy.get('.fr-toggle__label')
	// 						.first()
	// 						.click()
	// 						.then(() => {
	// 							cy.get('a[href="/public/product/2/stats"]').should('not.exist');
	// 						});
	// 				});
	// 		});
	// });
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
				.contains('Se connecter')
				.click()
				.then(() => {
					cy.url().should('eq', app_url + '/administration/dashboard/products');
					cy.wait(6000);
				});
		});
}
