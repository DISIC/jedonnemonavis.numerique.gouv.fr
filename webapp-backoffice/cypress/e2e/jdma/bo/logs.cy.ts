import { login, tryCloseNewsModal } from '../helpers';
import { selectors } from '../selectors';
import { adminEmail, adminPassword, appUrl } from '../variables';

describe('jdma-logs', () => {
	beforeEach(() => {
		cy.visit(appUrl + '/login');
		login(adminEmail, adminPassword);
		cy.url().should('eq', `${appUrl}${selectors.dashboard.products}`);
		cy.wait(1000);
		tryCloseNewsModal();
		cy.wait(1000);
	});

	it('should display the logs page with no events', () => {
		cy.wait(4000);
		cy.visit(appUrl + '/administration/dashboard/product/2/logs');
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
