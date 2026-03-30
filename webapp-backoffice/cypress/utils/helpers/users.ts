import { selectors } from '../selectors';
import { appUrl } from '../variables';
import { tryCloseModal } from './common';

export function navigateToCreatedProduct(shouldCheckA11y = false) {
	cy.visit(`${appUrl}${selectors.url.products}`);
	tryCloseModal();
	cy.url().should('include', selectors.url.products);
	cy.get('a[title*="e2e-jdma-service-test-users"]')
		.closest('a')
		.click({ force: true });
	cy.url().should('include', '/administration/dashboard/product/');
	cy.get(selectors.sideMenu.menu)
		.should('be.visible')
		.within(() => {
			cy.get(selectors.sideMenu.menuItem).contains("Droits d'accès").click();
		});
	if (shouldCheckA11y) {
		cy.injectAxe();
		cy.wait(500);
		cy.auditA11y();
	}
}
