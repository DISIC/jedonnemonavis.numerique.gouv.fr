const app_url = Cypress.env('app_base_url');
const app_form_url = Cypress.env('app_form_base_url')
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');
const userPassword = Cypress.env('user_password');
const mailer_url = Cypress.env('mailer_base_url');
const invitedEmail = Cypress.env('admin_guest_mail_bis');
const firstNameTest = "Stevie";
const lastNameTest = "Wonder"

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
        emailConfirmation: 'input[name="emailConfirmation"]'
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
        modify: 'Modifier'
    }
};

describe('jdma-admin', () => {
	beforeEach(() => {
		cy.visit(`${app_url}/login`);
	});

	it('change identity parameters', () => {
        login(invitedEmail, userPassword);
        checkAccountHeader('John Doe', invitedEmail)
        cy.contains('li', selectors.menu.account).click({force : true});
        cy.wait(1000);
        clickModifyCard(selectors.card.identity)
        cy.wait(1000);
        fillForm({firstName: firstNameTest, lastName: lastNameTest})
        cy.wait(1000);
        cy.contains('button', selectors.action.save).click()
        cy.wait(1000);
        checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmail)
        logout();
    })

    it('bad emails patterns should not work', () => {
        login(invitedEmail, userPassword);
        checkAccountHeader(`${firstNameTest} ${lastNameTest}`, invitedEmail)
        cy.contains('li', selectors.menu.account).click({force : true});
        clickModifyCard(selectors.card.credentials)
        fillForm({email: 'zrgzgr.gr', emailConfirmation: 'test@gmail.com'})
        cy.contains('button', selectors.action.save).click()
        cy.contains('p', "Format d'adresse e-mail invalide").should('exist')
        cy.contains('button', selectors.action.save).should('exist')
    })
});

// Helpers

function login(email, password) {
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Confirmer').click();
}

function logout() {
	cy.reload();
	cy.wait(2000);
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
            cy.get('div.fr-text--bold')
            .should('contain.text', name)
            cy.get('div').should('contain.text', invitedEmail);
        });
}

function clickModifyCard(nameCard) {
    cy.contains('h4', nameCard)
    .parents('.fr-card')
    .find('button.fr-btn')
    .click();
}

function fillForm({ firstName = '', lastName = '', email = '', emailConfirmation = '' }) {
    if(firstName !== '') {
	    cy.get(selectors.accountForm.firstName).clear().type(firstName, { force: true });
    }
    if(lastName !== '') {
	    cy.get(selectors.accountForm.lastName).clear().type(lastName);
    }
	if(email !== '') {
		cy.get(selectors.accountForm.email).clear().type(email);
	}
	if(emailConfirmation !== '') {
		cy.get(selectors.accountForm.emailConfirmation).clear().type(emailConfirmation);
	}
}

