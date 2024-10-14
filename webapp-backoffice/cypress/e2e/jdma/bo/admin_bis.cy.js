const app_url = Cypress.env('app_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');
const userPassword = Cypress.env('user_password');
const mailer_url = Cypress.env('mailer_base_url');
const invitedEmail = Cypress.env('admin_guest_mail_bis');
const nameTestOrga = "test-orga"

describe('jdma-admin', () => {

	/*it('try connect and disconnect admin', () => {
		connectAdmin();
		cy.wait(1000);
		disconnect();
	})*/

	it('try create organisation', () => {
		connectAdmin();
		cy.wait(1000);
		createOrga();
		cy.wait(1000);
		cy.visit(app_url + '/administration/dashboard/entities')
		cy.wait(1000);
		cy.get('.fr-card').contains('p', nameTestOrga).should('exist');
		disconnect();
	})

	it('try to invite admin', () => {
		connectAdmin();
		cy.wait(1000);
		inviteAdmin();
		cy.wait(1000);
		checkInviteWithMail();
		disconnect();
	})
});

function connectAdmin() {
	cy.visit(app_url + '/login')
	cy.get('input[name="email"]').click()
	cy.get('input[name="email"]').type(adminEmail)
	cy.contains('button', 'Continuer').click();
	cy.wait(1000);
	cy.get('input[autocomplete="current-password"]').click()
	cy.get('input[autocomplete="current-password"]').type(adminPassword)
	cy.get('[class*="LoginForm-button"]')
			.contains('Confirmer')
			.click()
			.then(() => {
				cy.url().should('eq', app_url + '/administration/dashboard/products');
			});
}

function disconnect() {
	cy.visit(app_url);
	cy.wait(1000);
	cy.get('.fr-header__tools > .fr-header__tools-links > .fr-btns-group > li > #fr-header-public-header-quick-access-item--D_connexion-0').click()
}

function createOrga() {
	cy.contains('a', 'Organisations').click();
	cy.contains('button', 'Ajouter une organisation').click();
	cy.wait(1000);
    cy.get('input[name="name"]').type(nameTestOrga);
    cy.get('input[name="acronym"]').type(nameTestOrga);
    cy.contains('button', 'Créer une organisation').click();
}

function inviteAdmin() {
	cy.contains('a', 'Organisations').click();
	cy.wait(1000);
	cy.get('.fr-card').contains('test-orga')
		.parents('.fr-card')
		.find('button')
		.contains('Gérer les administrateurs')
		.click(); 
	cy.wait(1000);
	cy.get('input[name="email"]').type(invitedEmail);
    cy.contains('button', 'Inviter').click();
}

function checkInviteInApp() {

}

function checkInviteWithMail() {
	cy.visit(mailer_url);
	cy.wait(1000);
	cy.get('button[ng-click="refresh()"]').click();
	cy.wait(1000);
	cy.get('.msglist-message')
		.contains('span', 'Invitation à rejoindre « Je donne mon avis »') // Trouve la card avec le texte
		.parents('.msglist-message') // Remonte au conteneur parent
		.contains('div', invitedEmail) // Cherche l'email dans la card
		.should('exist');
}

