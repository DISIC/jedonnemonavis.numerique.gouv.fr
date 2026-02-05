import { selectors } from '../selectors';
import { mailerUrl } from '../variables';

export function deleteService(serviceName: string) {
	cy.get(selectors.productTitle)
		.contains(serviceName)
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

export function getEmail() {
	cy.visit(mailerUrl);
	cy.get('button.btn-default[title="Refresh"]').click();

	cy.get('div.messages')
		.find('div.msglist-message')
		.first()
		.click({ force: true });
	cy.get('ul.nav-tabs').contains('Plain text').click();

	cy.get('#preview-plain a').each($link => {
		const href = $link.attr('href');
		if (href && href.includes('/register')) {
			cy.wrap($link).invoke('removeAttr', 'target').click();
		}
	});

	clearInbox();
}

export function clearInbox() {
	cy.visit(mailerUrl);
	cy.get('.nav-pills').contains('Delete all messages').click();
	cy.get('.modal-footer').contains('Delete all messages').click();
}
