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
		visitLogsPage();
		cy.get('h1').contains("Historique d'activité");
		cy.get('table').should('exist');
		cy.get('table tbody tr')
			.last()
			.within(() => {
				cy.get('td')
					.last()
					.should(
						'contain',
						"Invitation de l'utilisateur e2e-jdma-test-invite-bis@beta.gouv.fr à l'organisation"
					);
			});
	});

	it('should filter the logs by invite', () => {
		visitLogsPage();
		cy.get('h1').contains("Historique d'activité");
		cy.get('table').should('exist');
		cy.get('#filter-action').click();

		cy.get('#filter-action-listbox')
			.contains("Invitation d'utilisateur dans une organisation")
			.click({ force: true });

		cy.get('.fr-tag')
			.find('p')
			.should('have.text', "Invitation d'utilisateur dans une organisation");

		cy.get('table tbody tr')
			.last()
			.within(() => {
				cy.get('td')
					.last()
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

function visitLogsPage() {
	cy.wait(8000);
	cy.visit(app_url + '/administration/dashboard/product/5/logs');
	cy.get('.fr-sidemenu__link[alt="Consulter l\'historique d\'activité"]')
		.should('have.attr', 'aria-current', 'page')
		.and('contain', "Historique d'activité")
		.click();
}
function login(email, password) {
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Se connecter').click();
	cy.url().should('eq', app_url + '/administration/dashboard/products');
	cy.wait(8000);
}
