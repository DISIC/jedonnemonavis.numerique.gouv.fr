import { selectors } from '../selectors';
import { appFormUrl, mailerUrl } from '../variables';

export function deleteService(serviceName: string) {
	cy.contains('a', serviceName)
		.parents('div.fr-card')
		.within(() => {
			cy.get('#button-options-service').click();
		});
	cy.wait(1000);
	cy.contains('li', 'Supprimer ce service').click({ force: true });
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

export function checkform(shouldWork = false) {
	cy.visit(`${appFormUrl}/Demarches/4?button=7`, { failOnStatusCode: false });
	if (shouldWork) {
		cy.contains('h1', 'Je donne mon avis').should('exist');
		cy.contains('h1', 'Formulaire non trouvé').should('not.exist');
	} else {
		cy.contains('h1', 'Formulaire non trouvé').should('exist');
	}
}

export function checkMail(click = false, topic = '') {
	cy.visit(mailerUrl);
	cy.wait(1000);
	cy.get('button[ng-click="refresh()"]').click();
	cy.wait(1000);
	cy.get('.msglist-message')
		.contains('span', topic)
		.should('exist')
		.then($message => {
			if (click) {
				cy.wrap($message).click();
				cy.get('ul.nav-tabs').contains('Plain text').click();
				cy.get('#preview-plain')
					.find('a')
					.each($link => {
						const href = $link.attr('href');
						if (href && href.includes('/register')) {
							cy.wrap($link).invoke('removeAttr', 'target').click();
						}
					});
			}
		});
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
