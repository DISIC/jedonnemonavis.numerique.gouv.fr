import { selectors } from '../selectors';

export function navigateToCreatedProduct() {
	cy.url().should('include', selectors.dashboard.products);
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
