import { selectors } from '../selectors';
import { appUrl } from '../variables';
import { tryCloseNewsModal } from './common';

export function navigateToCreatedProduct() {
	cy.visit(`${appUrl}${selectors.url.products}`);
	tryCloseNewsModal();
	cy.url().should('include', selectors.url.products);
	cy.get(selectors.productLink)
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
