import { selectors } from '../selectors';

export function checkAccountHeader(name: string, invitedEmail: string) {
	cy.get('header').contains('Compte').click({ force: true });
	cy.injectAxe();
	cy.wait(500);
	cy.auditA11y(null, { withDetails: true });
	cy.get('ul.MuiList-root')
		.find('li')
		.first()
		.within(() => {
			cy.get('div.fr-text--bold').should('contain.text', name);
			cy.get('div').should('contain.text', invitedEmail);
		});
}

export function openAccountInfos() {
	cy.get('#option-menu')
		.contains('li', selectors.menu.account)
		.click({ force: true });
}

export function clickModifyCard(nameCard: string) {
	cy.auditA11y();
	cy.contains('h3', nameCard)
		.parents('.fr-card')
		.contains('button.fr-btn', 'Modifier')
		.click({ force: true });
}

export function fillAccountForm({ firstName = '', lastName = '' }) {
	if (firstName !== '') {
		cy.get(selectors.accountForm.firstName)
			.clear({ force: true })
			.type(firstName, { force: true });
	}
	if (lastName !== '') {
		cy.get(selectors.accountForm.lastName)
			.clear({ force: true })
			.type(lastName, { force: true });
	}
}

export function deleteAccount() {
	cy.contains('button', selectors.action.delete).click({ force: true });
	cy.contains('button', selectors.action.confirmDelete).should('be.disabled');
	cy.get(selectors.accountForm.confirm)
		.clear({ force: true })
		.type('blabla', { force: true });
	cy.contains('button', selectors.action.confirmDelete).should('be.disabled');
	cy.contains('p', 'Mot de confirmation incorrect').should('exist');
	cy.get(selectors.accountForm.confirm)
		.clear({ force: true })
		.type('supprimer', { force: true });
	cy.auditA11y();
	cy.contains('button', selectors.action.confirmDelete)
		.should('not.be.disabled')
		.click({ force: true });
}
