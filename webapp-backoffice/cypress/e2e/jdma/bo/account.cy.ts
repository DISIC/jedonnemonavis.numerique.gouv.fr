import {
	checkAccountHeader,
	clickModifyCard,
	deleteAccount,
	fillAccountForm,
	openAccountInfos
} from '../../../utils/helpers/account';
import { login, logout } from '../../../utils/helpers/common';
import { selectors } from '../../../utils/selectors';
import {
	firstNameTest,
	invitedEmailBis,
	lastNameTest
} from '../../../utils/variables';

describe('jdma-account', () => {
	it('change identity parameters', () => {
		login(invitedEmailBis);
		cy.injectAxe();
		cy.wait(500);
		checkAccountHeader('John Doe', invitedEmailBis);
		openAccountInfos();
		clickModifyCard(selectors.card.identity);
		cy.wait(500);
		cy.auditA11y();
		fillAccountForm({ firstName: firstNameTest, lastName: lastNameTest });
		cy.contains('button', selectors.action.save).click({ force: true });
		checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmailBis);
		logout();
	});

	it('shows the ProConnect email as read-only credentials', () => {
		login(invitedEmailBis);
		cy.injectAxe();
		checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmailBis);
		openAccountInfos();
		cy.contains('h3', selectors.card.credentials)
			.parents('.fr-card')
			.within(() => {
				cy.contains(invitedEmailBis).should('be.visible');
				cy.contains('votre compte ProConnect').should('be.visible');
				cy.contains('button', selectors.action.modify).should('not.exist');
				cy.contains('Mot de passe').should('not.exist');
			});
	});

	it('delete account', () => {
		login(invitedEmailBis);
		cy.injectAxe();
		checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmailBis);
		openAccountInfos();
		cy.injectAxe();
		deleteAccount();
		cy.url().should('include', '/login');
		cy.get(selectors.proconnectButton).should('be.visible');
	});
});
