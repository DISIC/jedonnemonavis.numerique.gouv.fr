const app_url = Cypress.env('app_base_url');
const app_form_url = Cypress.env('app_form_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');
const userPassword = Cypress.env('user_password');
const mailer_url = Cypress.env('mailer_base_url');
const invitedEmail = Cypress.env('admin_guest_mail_bis');
const firstNameTest = 'Stevie';
const lastNameTest = 'Wonder';
const newEmailTest = 'stevie-wonder@beta.gouv.fr';

// Sélecteurs communs
const selectors = {
	loginForm: {
		email: 'input[name="email"]',
		password: 'input[type="password"]',
		continueButton: '[class*="LoginForm-button"]'
	},
	accountForm: {
		firstName: 'input[name="firstName"]',
		lastName: 'input[name="lastName"]',
		email: 'input[name="email"]',
		emailConfirmation: 'input[name="emailConfirmation"]',
		confirm: 'input[name="word"]'
	},
	card: {
		identity: 'Identité',
		credentials: 'Identifiants de connexion'
	},
	menu: {
		account: 'Informations personnelles'
	},
	action: {
		save: 'Sauvegarder',
		modify: 'Modifier',
		delete: 'Supprimer le compte',
		confirmDelete: 'Supprimer',
		confirm: 'Confirmer'
	}
};

describe('Account page', () => {
	beforeEach(() => {
		cy.visit(`${app_url}/login`);
	});

	it('change identity parameters', () => {
		login(invitedEmail, userPassword);
		checkAccountHeader('John Doe', invitedEmail);
		cy.contains('li', selectors.menu.account).click({ force: true });
		cy.wait(1000);
		clickModifyCard(selectors.card.identity);
		cy.wait(1000);
		fillForm({ firstName: firstNameTest, lastName: lastNameTest });
		cy.wait(1000);
		cy.contains('button', selectors.action.save).click();
		cy.wait(1000);
		checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmail);
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
		checkAccountHeader(`${firstNameTest} ${lastNameTest}`, newEmailTest);
		cy.contains('li', selectors.menu.account).click({ force: true });
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
		cy.url().should('include', '/login');
		cy.get(selectors.loginForm.email).type(newEmailTest);
		cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
		cy.contains('p', 'Aucun compte connu avec cette adresse e-mail.').should(
			'exist'
		);
	});
});

// Helpers
const tryCloseNewsModal = () => {
	cy.get('dialog#news-modal').then($modal => {
		if ($modal.length && $modal.is(':visible')) {
			cy.wrap($modal).within(() => {
				cy.contains('button', 'Fermer').click();
			});
		} else {
			cy.log('News modal not visible, skipping close action.');
		}
	});
};

function login(email, password) {
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Se connecter').click();
}

function logout() {
	cy.reload();
	cy.wait(2000);
	tryCloseNewsModal();
	cy.wait(1000);
	cy.get('header', { timeout: 10000 }).should('be.visible');
	cy.get('header').contains('Compte').click({ force: true });
	cy.contains('button', 'Se déconnecter').click({ force: true });
	cy.url().should('include', '/login');
}

function checkAccountHeader(name, invitedEmail) {
	cy.get('header').contains('Compte').click({ force: true });
	cy.get('ul.MuiList-root')
		.find('li')
		.first()
		.within(() => {
			cy.get('div.fr-text--bold').should('contain.text', name);
			cy.get('div').should('contain.text', invitedEmail);
		});
}

function clickModifyCard(nameCard) {
	cy.contains('h4', nameCard).parents('.fr-card').find('button.fr-btn').click();
}

function fillForm({
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
		cy.get(selectors.accountForm.lastName).clear().type(lastName);
	}
	if (email !== '') {
		cy.get(selectors.accountForm.email).clear().type(email);
	}
	if (emailConfirmation !== '') {
		cy.get(selectors.accountForm.emailConfirmation)
			.clear()
			.type(emailConfirmation);
	}
}

function testEmail({
	email = '',
	confirmationEmail = '',
	expectedMEssage = ''
}) {
	login(invitedEmail, userPassword);
	checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmail);
	cy.contains('li', selectors.menu.account).click({ force: true });
	clickModifyCard(selectors.card.credentials);
	fillForm({ email: email, emailConfirmation: confirmationEmail });
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
