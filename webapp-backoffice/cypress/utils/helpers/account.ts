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
	cy.get('ul.MuiList-root')
		.find('li')
		.first()
		.within(() => {
			cy.get('div.fr-text--bold').should('contain.text', name);
			cy.get('div').should('contain.text', invitedEmail);
		});
}

export function clickModifyCard(nameCard: string) {
	cy.contains('h4', nameCard).parents('.fr-card').find('button.fr-btn').click();
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
	cy.checkA11y(
		null,
		{ includedImpacts: ['moderate', 'serious', 'critical'] },
		displayViolationsTable
	);
	checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmailBis);
	cy.contains('li', selectors.menu.account).click({ force: true });
	clickModifyCard(selectors.card.credentials);
	fillAccountForm({ email: email, emailConfirmation: confirmationEmail });
	cy.contains('button', selectors.action.save).click();
	cy.contains('button', selectors.action.confirm).click();

	if (expectedMEssage !== '') {
		cy.contains('p', expectedMEssage).should('exist');
		cy.contains('button', selectors.action.save).should('exist');
	} else {
		login(newEmailTest, userPassword);
		checkAccountHeader(`${firstNameTest} ${lastNameTest}`, newEmailTest);
	}
	logout();
}
