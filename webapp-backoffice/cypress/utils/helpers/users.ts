import { selectors } from '../selectors';
import { appUrl } from '../variables';
import { addUrls, selectEntity, tryCloseNewsModal } from './common';

export function navigateToCreatedProduct() {
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

export function createProduct() {
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
	cy.wait(1000);
}
