import { login, tryCloseNewsModal } from '../../../utils/helpers/common';
import { selectors } from '../../../utils/selectors';
import { adminEmail, adminPassword, appUrl } from '../../../utils/variables';

describe('jdma-logs', () => {
	beforeEach(() => {
		login(adminEmail, adminPassword);
	});

	it('should display the logs page with no events', () => {
		cy.visit(appUrl + '/administration/dashboard/product/2/logs');
		cy.get(
			'.fr-sidemenu__link[href="/administration/dashboard/product/2/logs"]'
		)
			.should('have.attr', 'aria-current', 'page')
			.and('contain', "Historique d'activité")
			.click();
		cy.get('h2').contains("Historique d'activité");
		cy.get('p').contains('Aucune activité trouvée');
	});
});
