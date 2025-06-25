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
		cy.wait(1000);
		tryCloseNewsModal();
		cy.wait(1000);
	});

	it('should display the logs page with no events', () => {
		cy.wait(4000);
		cy.visit(app_url + '/administration/dashboard/product/2/logs');
		cy.get(
			'.fr-sidemenu__link[href="/administration/dashboard/product/2/logs"]'
		)
			.should('have.attr', 'aria-current', 'page')
			.and('contain', "Historique d'activité")
			.click();
		cy.get('h2').contains("Historique d'activité");
		cy.get('p').contains('Aucun événement trouvé');
	});
});

function loginAsAdmin() {
	login(adminEmail, adminPassword);
}

function login(email, password) {
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Se connecter').click();
	cy.url().should('eq', app_url + '/administration/dashboard/products');
	cy.wait(8000);
}
const tryCloseNewsModal = () => {
	cy.get('dialog#news-modal', { timeout: 4000 })
		.should(Cypress._.noop) // évite l'échec si l'élément est introuvable
		.then($modal => {
			if ($modal.length && $modal.is(':visible')) {
				cy.wrap($modal).within(() => {
					cy.contains('button', 'Fermer').click();
				});
			} else {
				cy.log('News modal not visible, skipping close action.');
			}
		})
		.catch(() => {
			cy.log('News modal not found within timeout, skipping close action.');
		});
};
