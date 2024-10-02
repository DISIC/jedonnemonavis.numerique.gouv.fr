const app_url = Cypress.env('app_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');

describe('jdma-connect', () => {
	beforeEach(() => {
		cy.visit(app_url + '/login');
	});

	it('try connect with admin and succeed', () => {
		cy.get('input[name="email"]').type(adminEmail);
		cy.get('[class*="LoginForm-button"]')
			.contains('Continuer')
			.click()
			.then(() => {
				cy.wait(4000);
				cy.get('input[type="password"]').type(adminPassword);
			});
		cy.get('[class*="LoginForm-button"]')
			.contains('Confirmer')
			.click()
			.then(() => {
				cy.url().should('eq', app_url + '/administration/dashboard/products');
			});
	});

  it('try connect with admin and fail', () => {
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('[class*="LoginForm-button"]')
      .contains('Continuer')
      .click()
      .then(() => {
        cy.wait(4000);
        cy.get('input[type="password"]').type('wrongpassword');
      });
    cy.get('[class*="LoginForm-button"]')
      .contains('Confirmer')
      .click()
      .then(() => {
        cy.url().should('eq', app_url + '/login');
      });
  });
});
  