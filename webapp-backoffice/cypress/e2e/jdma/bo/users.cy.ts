import { createOrEditProduct, login } from '../../../utils/helpers/common';
import { navigateToCreatedProduct } from '../../../utils/helpers/users';
import { selectors } from '../../../utils/selectors';
import { adminEmail, adminPassword } from '../../../utils/variables';

describe('jdma-users', () => {
	beforeEach(() => {
		login(adminEmail, adminPassword);
		cy.injectAxe();
	});

	it('should create a service and attach an organization', () => {
		createOrEditProduct('e2e-jdma-service-test-users');
	});

	it('should display service and organization administrators', () => {
		navigateToCreatedProduct(true);
		cy.get('div.fr-card div.fr-grid-row div.fr-col span').should(
			'contain',
			'admin@example.com'
		);
		cy.get('div.fr-card').should('contain', 'admin@example.com');
	});

	it('should invite an administrator', () => {
		navigateToCreatedProduct();
		cy.get('button').contains('Inviter des utilisateurs').click();

		cy.get('input[class*="fr-input"]').type('user3@example.com');

		cy.get('input[value="carrier_admin"]').siblings('label').click();

		cy.get('button').contains('Inviter et continuer').click();
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
		cy.get('div.fr-card div.fr-grid-row div.fr-col a')
			.filter(':contains("user 3")')
			.first()
			.click();
		cy.injectAxe();
		cy.wait(500);
		cy.auditA11y();

		cy.url().should('include', '/administration/dashboard/user/');
		cy.get(selectors.sideMenu.menu)
			.should('be.visible')
			.within(() => {
				cy.get(selectors.sideMenu.menuItem).contains('Accès').click();
			});
		cy.contains('h2', 'Accès').should('exist');
		cy.auditA11y();

		cy.get('h4')
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
		cy.wait(500);
		cy.auditA11y();
		cy.get('#user-switch-role-modal')
			.should('be.visible')
			.within(() => {
				cy.contains('button', 'Confirmer').click();
			});
	});

	it('should have removed the user', () => {
		navigateToCreatedProduct();
		cy.get('div.fr-card div span').should('not.contain', 'user3@example.com');
	});
});
