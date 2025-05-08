const app_url = Cypress.env('app_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');

const selectors = {
	loginForm: {
		email: 'input[name="email"]',
		password: 'input[type="password"]',
		continueButton: '[class*="LoginForm-button"]'
	},
	dashboard: {
		products: '/administration/dashboard/products'
	}
};
describe('Product', () => {
	beforeEach(() => {
		cy.visit(`${app_url}/login`);
		loginAsAdmin();
		cy.url().should('eq', `${app_url}${selectors.dashboard.products}`);
	});

	it('should display the jdma button code', () => {
		cy.visit(app_url + '/administration/dashboard/product/5/buttons');

		cy.get('h1').should('contain', 'e2e-jdma-service-test-1').should('exist');

		cy.get('.fr-card').find('.fr-btn--secondary').click({ force: true });

		cy.get('.MuiMenu-paper')
			.find('.MuiMenuItem-root')
			.contains('Voir le code')
			.click({ force: true });

		cy.get('.fr-grid-row h5')
			.contains('Thème clair')
			.parent()
			.find('img')
			.should('have.attr', 'src', '/assets/bouton-bleu-clair.svg');

		cy.contains('label.fr-label', 'Blanc')
			.parent('.fr-radio-group')
			.find('input[type="radio"]')
			.check({ force: true });

		cy.get('.fr-grid-row h5')
			.contains('Thème clair')
			.parent()
			.find('img')
			.should('have.attr', 'src', '/assets/bouton-blanc-clair.svg');
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
}
