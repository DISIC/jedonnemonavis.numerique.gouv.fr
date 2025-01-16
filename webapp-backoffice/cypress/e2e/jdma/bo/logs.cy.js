const app_url = Cypress.env('app_base_url');
const app_form_url = Cypress.env('app_form_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');
const userPassword = Cypress.env('user_password');

const selectors = {
	loginForm: {
		email: 'input[name="email"]',
		password: 'input[type="password"]',
		continueButton: '[class*="LoginForm-button"]'
	},
	dashboard: {
		products: '/administration/dashboard/products',
		entities: '/administration/dashboard/entities',
		users: '/administration/dashboard/users',
		nameTestOrga: 'e2e-jdma-entity-test',
		nameTestService: 'e2e-jdma-service-test'
	}
};

describe('jdma-logs', () => {
	beforeEach(() => {
		cy.visit(app_url + '/login');
		loginAsAdmin();
		cy.url().should('eq', `${app_url}${selectors.dashboard.products}`);
	});

	it('should display the logs page with no events', () => {
		cy.wait(8000);
		cy.visit(app_url + '/administration/dashboard/product/5/logs');
		cy.get('.fr-sidemenu__link[alt="Consulter le journal d\'activité"]')
			.should('have.attr', 'aria-current', 'page')
			.and('contain', "Journal d'activité")
			.click();
		cy.get('h1').contains("Journal d'activité");
		cy.get('table').should('exist');
		cy.get('table tbody tr')
			.last()
			.within(() => {
				cy.get('td')
					.eq(2)
					.should(
						'contain',
						"Invitation de l'utilisateur e2e-jdma-test-invite-bis@beta.gouv.fr à l'organisation"
					);
			});
	});
});

function loginAsAdmin() {
	login(adminEmail, adminPassword);
}

function login(email, password) {
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Confirmer').click();
	cy.url().should('eq', app_url + '/administration/dashboard/products');
	cy.wait(8000);
}
