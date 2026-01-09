import {
	checkAccountHeader,
	clickModifyCard,
	deleteAccount,
	fillAccountForm,
	testEmail
} from '../../../utils/helpers/account';
import { login, logout } from '../../../utils/helpers/common';
import { selectors } from '../../../utils/selectors';
import {
	adminEmail,
	firstNameTest,
	invitedEmailBis,
	lastNameTest,
	newEmailTest,
	userPassword
} from '../../../utils/variables';

describe('jdma-account', () => {
	it.only('change identity parameters', () => {
		login(invitedEmailBis, userPassword);
		cy.injectAxe();
		cy.wait(500);
		checkAccountHeader('John Doe', invitedEmailBis);
		cy.contains('li', selectors.menu.account).click({ force: true });
		clickModifyCard(selectors.card.identity);
		cy.wait(500);
		cy.auditA11y();
		fillAccountForm({ firstName: firstNameTest, lastName: lastNameTest });
		cy.contains('button', selectors.action.save).click();
		checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmailBis);
		logout();
	});

	it('change email : bad emails patterns should not work', () => {
		testEmail({
			email: 'zrgzgr.gr',
			confirmationEmail: 'test@gmail.com',
			expectedMEssage: 'Les adresses e-mail ne correspondent pas'
		});
	});

	it('change email : different emails should not work', () => {
		testEmail({
			email: 'test1@gmail.com',
			confirmationEmail: 'test@gmail.com',
			expectedMEssage: 'Les adresses e-mail ne correspondent pas'
		});
	});

	it('change email : not whitelisted emails should not work', () => {
		testEmail({
			email: 'test@gmail.com',
			confirmationEmail: 'test@gmail.com',
			expectedMEssage:
				'Cette adresse mail ne fait pas partie des domaines autorisés. Veuillez contacter le support si vous souhaitez utiliser cette adresse.'
		});
	});

	it('change email : allready existing emails should not work', () => {
		testEmail({
			email: adminEmail,
			confirmationEmail: adminEmail,
			expectedMEssage: 'Cette adresse mail existe déjà'
		});
	});

	it('change email : should work if everything OK', () => {
		testEmail({ email: newEmailTest, confirmationEmail: newEmailTest });
	});

	it('delete account', () => {
		login(newEmailTest, userPassword);
		cy.injectAxe();
		checkAccountHeader(`${firstNameTest} ${lastNameTest}`, newEmailTest);
		cy.contains('li', selectors.menu.account).click({ force: true });
		deleteAccount();
		cy.url().should('include', '/login');
		cy.get(selectors.loginForm.email).type(newEmailTest);
		cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
		cy.contains('p', 'Aucun compte connu avec cette adresse e-mail.').should(
			'exist'
		);
	});
});
