import { selectors } from '../selectors';
import { displayViolationsTable } from '../tools';
import {
	firstNameTest,
	invitedEmailBis,
	lastNameTest,
	newEmailTest,
	userPassword
} from '../variables';
import { login, logout } from './common';

export function checkAccountHeader(name: string, invitedEmail: string) {
	cy.get('header').contains('Compte').click({ force: true });
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

export function clickModifyCard(nameCard: string) {
	cy.auditA11y();
	cy.contains('h3', nameCard)
		.parents('.fr-card')
		.find('button.fr-btn')
		.click({ force: true });
}

export function fillAccountForm({
	firstName = '',
	lastName = '',
	email = '',
	emailConfirmation = ''
}) {
	if (firstName !== '') {
		cy.get(selectors.accountForm.firstName)
			.clear()
			.type(firstName, { force: true });
	}
	if (lastName !== '') {
		cy.get(selectors.accountForm.lastName)
			.clear()
			.type(lastName, { force: true });
	}
	if (email !== '') {
		cy.get(selectors.accountForm.email).clear().type(email, { force: true });
	}
	if (emailConfirmation !== '') {
		cy.get(selectors.accountForm.emailConfirmation)
			.clear()
			.type(emailConfirmation);
	}
}

export function testEmail({
	email = '',
	confirmationEmail = '',
	expectedMEssage = ''
}) {
	login(invitedEmailBis, userPassword);
	cy.injectAxe();
	checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmailBis);
	cy.contains('li', selectors.menu.account).click({ force: true });
	clickModifyCard(selectors.card.credentials);
	fillAccountForm({ email: email, emailConfirmation: confirmationEmail });
	cy.contains('button', selectors.action.save).click();
	cy.contains('button', selectors.action.confirm).click();
	cy.wait(500);

	if (expectedMEssage !== '') {
		cy.contains('p', expectedMEssage).should('exist');
		cy.contains('button', selectors.action.save).should('exist');
	} else {
		login(newEmailTest, userPassword);
		checkAccountHeader(`${firstNameTest} ${lastNameTest}`, newEmailTest);
	}
	logout();
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
	cy.contains('button', selectors.action.confirmDelete)
		.should('not.be.disabled')
		.click({ force: true });
}
