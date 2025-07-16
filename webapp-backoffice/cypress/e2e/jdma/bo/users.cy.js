const app_url = Cypress.env('app_base_url');
const app_form_url = Cypress.env('app_form_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');

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
	},
	modal: {
		product: 'dialog#product-modal',
		entity: 'dialog#entity-modal',
		button: 'dialog#button-modal'
	},
	sideMenu: {
		menu: 'nav.fr-sidemenu',
		menuItem: 'li.fr-sidemenu__item'
	},
	modalFooter: '.fr-modal__footer',
	productTitle: '[class*="productTitle"]',
	productForm: '#product-form'
};

describe('jdma-users', () => {
	beforeEach(() => {
		cy.visit(`${app_url}/login`);
		loginAsAdmin();
		cy.url().should('eq', `${app_url}${selectors.dashboard.products}`);
		cy.wait(1000);
		tryCloseNewsModal();
		cy.wait(1000);
	});

	it('should create a service and attach an organization', () => {
		createProduct();
	});

	it('should navigate to created product access page', () => {
		navigateToCreatedProduct();
	});

	it('should display service administrators', () => {
		navigateToCreatedProduct();
		cy.get('div.fr-card div.fr-grid-row div.fr-col span').should(
			'contain',
			'admin@example.com'
		);
	});

	it('should display organization administrators', () => {
		navigateToCreatedProduct();
		cy.get('div.fr-card').should('contain', 'admin@example.com');
	});

	it('should invite an administrator', () => {
		navigateToCreatedProduct();
		cy.get('button').contains('Inviter des utilisateurs').click();

		cy.get('input[class*="fr-input"]').type('user3@example.com');

		cy.get('input[value="carrier_admin"]').siblings('label').click();

		cy.get('button').contains('Inviter').click();
	});

	it('should display the invited user', () => {
		navigateToCreatedProduct();
		cy.get('div.fr-card div.fr-grid-row div.fr-col span').should(
			'contain',
			'user3@example.com'
		);
	});

	it('should navigate to the user page, verify if the user is admin and then remove the access', () => {
		navigateToCreatedProduct();
		cy.get('nav.fr-nav ul.fr-nav__list li.fr-nav__item a')
			.filter(':contains("Utilisateurs")')
			.first()
			.click();
		cy.url().should('include', '/administration/dashboard/users');
		cy.wait(1000);
		cy.get('div.fr-card div.fr-grid-row div.fr-col a')
			.filter(':contains("user 3")')
			.first()
			.click();
		cy.wait(1000);
		cy.url().should('include', '/administration/dashboard/user/');
		cy.get(selectors.sideMenu.menu)
			.should('be.visible')
			.within(() => {
				cy.get(selectors.sideMenu.menuItem).contains('Accès').click();
			});

		cy.wait(1000);

		cy.get('h5')
			.filter(':contains("e2e-jdma-entity-test")')
			.should('exist')
			.parent('li')
			.find('.fr-card')
			.within(() => {
				cy.get('.fr-text--bold')
					.contains('e2e-jdma-service-test-users')
					.parents('.fr-card')
					.find('button#button-options')
					.click();
			});
		cy.contains("Retirer l'accès").click({ force: true });
		cy.get('#user-switch-role-modal')
			.should('be.visible')
			.within(() => {
				cy.contains('button', 'Confirmer').click();
			});
	});

	it('should have removed the user', () => {
		navigateToCreatedProduct();
		cy.get('div.fr-card div span', { timeout: 10000 }).should(
			'not.contain',
			'user3@example.com'
		);
	});
});

function navigateToCreatedProduct() {
	cy.visit(`${app_url}${selectors.dashboard.products}`);
	cy.wait(1000);
	tryCloseNewsModal();
	cy.wait(1000);
	cy.url().should('include', selectors.dashboard.products);
	cy.get(selectors.productTitle)
		.filter(':contains("e2e-jdma-service-test-users")')
		.should('have.length', 1)
		.should('contain', 'e2e-jdma-service-test-users')
		.closest('a')
		.first()
		.click();
	cy.url().should('include', '/administration/dashboard/product/');
	cy.get(selectors.sideMenu.menu)
		.should('be.visible')
		.within(() => {
			cy.get(selectors.sideMenu.menuItem).contains("Droits d'accès").click();
		});
}

function loginAsAdmin() {
	login(adminEmail, adminPassword);
}

function addUrls(urls) {
	urls.forEach((url, index) => {
		if (index > 0) cy.contains('button', 'Ajouter un URL').click();
		cy.get(`input[name="urls.${index}.value"]`).type(url);
	});
}

function login(email, password) {
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Se connecter').click();
}

const tryCloseNewsModal = () => {
	cy.wait(3000);
	cy.get('body').then($body => {
		const $modal = $body.find('dialog#news-modal');
		if ($modal.length && $modal.is(':visible')) {
			cy.wrap($modal).within(() => {
				cy.contains('button', 'Fermer').click();
			});
		} else {
			cy.log('News modal not found or not visible, skipping close action.');
		}
	});
};

function createProduct() {
	cy.contains('button', 'Ajouter un nouveau service').click();
	cy.get(selectors.productForm, { timeout: 10000 })
		.should('be.visible')
		.within(() => {
			cy.get('input[name="title"]').type('e2e-jdma-service-test-users');
			selectEntity();
			addUrls(['http://testurl1.com/', 'http://testurl2.com/']);
		});

	cy.get(selectors.modalFooter)
		.contains('button', 'Ajouter ce service')
		.click();
	cy.wait(2000);
}

function selectEntity() {
	cy.get('input#entity-select-autocomplete').click();
	cy.get('div[role="presentation"]')
		.should('be.visible')
		.find('[id="entity-select-autocomplete-option-0"]')
		.click();
}
