const app_url = Cypress.env('app_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');
const userEmail = 'user4@example.com';
const userPassword = 'jdma';

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

describe('Access Management - Invite a user to be an admin of the service', () => {
	beforeEach(() => {
		cy.visit(`${app_url}/login`);
		loginAsAdmin();
		cy.url().should('eq', `${app_url}${selectors.dashboard.products}`);
	});

	it('should invite a user to be an admin of the service', () => {
		cy.visit(`${app_url}/administration/dashboard/product/1/access`);
		cy.get('h2').should('contain', "Gérer l'accès");

		cy.get('.fr-btn--secondary').contains('Inviter des utilisateurs').click();

		cy.get('input[id^="input-"]').type('user4@example.com');

		cy.get('input[value="carrier_admin"]').check({ force: true });

		cy.get('.fr-modal__footer .fr-btn')
			.contains('Inviter')
			.click({ force: true });

		cy.wait(1000);

		cy.get('h2').contains('Administrateurs du service');
		cy.get('div.fr-card').contains('user4@example.com');
	});

	it('should change user4 from admin to user', () => {
		cy.visit(`${app_url}/administration/dashboard/product/1/access`);
		cy.get('h2').should('contain', "Gérer l'accès");

		cy.get('.fr-card')
			.contains('span', 'user 4')
			.closest('.fr-card')
			.find('.fr-btn--secondary')
			.contains('Options')
			.click({ force: true });

		cy.get('.MuiMenu-paper .MuiMenuItem-root')
			.contains('Passer en utilisateur du service')
			.click({ force: true });

		cy.get('.fr-modal__footer .fr-btn')
			.contains('Passer en utilisateur de service')
			.click({ force: true });

		cy.get('h2').should('not.contain', 'Administrateurs du service');
	});
});

describe('Access Management - Connect as a user', () => {
	beforeEach(() => {
		cy.visit(`${app_url}/login`);
		login(userEmail, userPassword);
		cy.url().should('eq', `${app_url}${selectors.dashboard.products}`);
	});

	it('should not have the modify options on button page', () => {
		cy.visit(`${app_url}/administration/dashboard/product/1/buttons`);
		cy.get('h2').should('contain', 'Voir les boutons');

		cy.get('button.fr-btn--secondary')
			.contains('Créer un bouton')
			.should('not.exist');

		cy.get('.fr-card')
			.contains('p', 'Button 1')
			.closest('.fr-card')
			.find('button#button-options')
			.contains('Options')
			.click();

		cy.get('.MuiMenu-paper .MuiMenuItem-root')
			.contains('Modifier')
			.should('not.exist');
	});

	it('should not see CRUD options on apiKeys', () => {
		cy.visit(`${app_url}/administration/dashboard/product/1/api_keys`);
		cy.get('h1').should('contain', 'Gérer les clés API');

		cy.get('body').then($body => {
			const buttonExists =
				$body.find('button:contains("Générer une nouvelle clé API")').length >
				0;
			expect(buttonExists).to.be.false;
		});
	});
});

describe('Access Management - Remove access of user4', () => {
	beforeEach(() => {
		cy.visit(`${app_url}/login`);
		loginAsAdmin();
		cy.url().should('eq', `${app_url}${selectors.dashboard.products}`);
	});
	it('should remove the access of user4', () => {
		cy.visit(`${app_url}/administration/dashboard/product/1/access`);
		cy.get('h2').should('contain', "Gérer l'accès");

		cy.get('.fr-card')
			.contains('span', 'user 4')
			.closest('.fr-card')
			.find('.fr-btn--secondary')
			.contains('Options')
			.click({ force: true });

		cy.get('.MuiMenu-paper .MuiMenuItem-root')
			.contains("Retirer l'accès")
			.click({ force: true });

		cy.get('.fr-modal__footer .fr-btn')
			.contains('Retirer')
			.click({ force: true });

		cy.get('h2').should('contain', 'Utilisateurs du service');
		cy.get('.fr-card').should('not.contain', 'user 4');
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
