import {
	addUrls,
	login,
	selectEntity,
	tryCloseNewsModal
} from '../../../utils/helpers/common';
import { selectors } from '../../../utils/selectors';
import { adminEmail, adminPassword, appUrl } from '../../../utils/variables';

describe('jdma-users', () => {
	beforeEach(() => {
		cy.visit(`${appUrl}/login`);
		login(adminEmail, adminPassword);
		cy.url().should('eq', `${appUrl}${selectors.dashboard.products}`);
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
	cy.visit(`${appUrl}${selectors.dashboard.products}`);
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
