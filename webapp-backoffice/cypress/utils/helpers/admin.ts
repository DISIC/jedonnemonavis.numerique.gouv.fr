import { selectors } from '../selectors';

export function deleteService(serviceName: string) {
	cy.get('a[title*="' + serviceName + '"]')
		.should('be.visible')
		.click({ force: true });

	cy.injectAxe();

	cy.contains('a', 'Informations').click();
	cy.wait(500);
	cy.auditA11y();

	cy.contains('button', 'Supprimer ce service').click({
		force: true
	});
	cy.wait(500);
	cy.auditA11y();
	cy.contains('button', 'Supprimer').click({ force: true });
}

export function restaureService() {
	cy.get('input[name="archived-products"]')
		.should('exist')
		.check({ force: true });
	cy.contains('div', selectors.dashboard.nameTestService).should('exist');
	cy.contains('button', 'Restaurer').should('exist').click();
	cy.get('.fr-modal__body').should('be.visible');
	cy.contains('button', 'Confirmer').click();
}
