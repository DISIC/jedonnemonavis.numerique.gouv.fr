const app_url = Cypress.env('app_base_url');
const app_form_url = Cypress.env('app_form_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');
const userPassword = Cypress.env('user_password');
const mailer_url = Cypress.env('mailer_base_url');
const invitedEmail = Cypress.env('admin_guest_mail_bis');

// Sélecteurs communs
const selectors = {
	loginForm: {
		email: 'input[name="email"]',
		password: 'input[type="password"]',
		continueButton: '[class*="LoginForm-button"]'
	},
	dashboard: {
		products: '/administration/dashboard/products',
		entities: '/administration/dashboard/entities',
		users: '/administration/dashboard/users',
		nameTestOrga: 'e2e-jdma-entity-test',
		nameTestService: 'e2e-jdma-service-test'
	},
	modal: {
		product: 'dialog#product-modal',
		entity: 'dialog#entity-modal',
		button: 'dialog#button-modal',
		form: 'dialog#new-form-modal'
	},
	modalFooter: '.fr-modal__footer',
	productTitle: '[class*="productTitle"]'
};

describe('jdma-admin', () => {
	beforeEach(() => {
		cy.visit(`${app_url}/login`);
		loginAsAdmin();
		cy.url().should('eq', `${app_url}${selectors.dashboard.products}`);
		cy.wait(1000);
		tryCloseNewsModal();
		cy.wait(1000);
	});

	it('create and delete users', () => {
		cy.visit(`${app_url}${selectors.dashboard.users}`);
		cy.reload();
		for (let i = 0; i < 3; i++) {
			cy.contains('button', 'Ajouter un nouvel utilisateur')
				.should('be.visible')
				.click();
			cy.wait(1000);
			fillForm({
				email: `test${i}@gmail.com`,
				password: userPassword,
				firstName: `Prénom ${i}`,
				lastName: `Nom ${i}`
			});
			cy.contains('button', 'Créer').click();
		}
		cy.get('input[placeholder="Rechercher un utilisateur"]').type('gmail');
		cy.contains('button', 'Rechercher').click();
		cy.wait(1000);
		cy.get('input[type="checkbox"]').should('have.length', 5);
		cy.get('input[type="checkbox"][value="value1"]').click({ force: true });
		cy.contains('button', 'Supprimer tous').click();
		cy.get('input[name="word"]').type('supprimer');
		cy.contains('button', 'Supprimer').click();
		cy.get('input[type="checkbox"]').should('have.length', 2);
		cy.get('input[placeholder="Rechercher un utilisateur"]').clear();
		cy.contains('button', 'Rechercher').click();
		cy.get('input[type="checkbox"]').should('have.length', 7);
	});

	it('create organisation', () => {
		cy.visit(`${app_url}${selectors.dashboard.entities}`);

		cy.get('nav').contains('Organisations').click();
		cy.url().should('eq', `${app_url}${selectors.dashboard.entities}`);

		cy.get('[class*="DashBoardEntities"]')
			.contains('Ajouter une organisation')
			.click();

		cy.get(selectors.modal.entity)
			.should('be.visible')
			.within(() => {
				cy.get('input[name="name"]').type(selectors.dashboard.nameTestOrga, {
					force: true
				});
				cy.get('input[name="acronym"]').type(selectors.dashboard.nameTestOrga, {
					force: true
				});
				cy.get(selectors.modalFooter)
					.contains('Créer une organisation')
					.click();
			});

		cy.visit(`${app_url}${selectors.dashboard.entities}`);
		cy.wait(1000);
		cy.get('.fr-card')
			.contains('p', selectors.dashboard.nameTestOrga)
			.should('exist');

		logout();
	});

	it('invite admin on organisation', () => {
		cy.visit(`${app_url}${selectors.dashboard.entities}`);
		cy.wait(1000);
		cy.get('.fr-card')
			.contains('p', selectors.dashboard.nameTestOrga)
			.should('exist')
			.parents('.fr-card')
			.find('button')
			.contains('Gérer les administrateurs')
			.click();

		cy.get('dialog#entity-rights-modal')
			.should('exist')
			.within(() => {
				cy.get('input[name="email"]').type(invitedEmail);
				cy.get('button').contains('Inviter').click();
				cy.get('[class*="entityCardWrapper"]')
					.contains(invitedEmail)
					.should('be.visible');
			});
		checkMail(false, 'Invitation à rejoindre « Je donne mon avis »');
		cy.visit(`${app_url}`);
		logout();
	});

	it('create service', () => {
		cy.get('#product-modal-control-button')
			.contains('Ajouter un nouveau service')
			.click();

		cy.get(selectors.modal.product)
			.should('be.visible')
			.within(() => {
				cy.get('input[name="title"]').type(selectors.dashboard.nameTestService);
				selectEntity();
				cy.get('input[name="urls.0.value"]').type('http://testurl1.com/');
			});

		cy.get(selectors.modalFooter).contains('Ajouter ce service').click();
		cy.visit(`${app_url}`);
		cy.get(selectors.productTitle)
			.should('exist')
			.then($productTitle => {
				cy.wrap($productTitle).contains(selectors.dashboard.nameTestService);
			});

		logout();
	});

	it('register guest admin', () => {
		logout();
		checkMail(true, 'Invitation à rejoindre « Je donne mon avis »');
		fillForm({ password: userPassword });
		cy.get('button').contains('Valider').click();
	});

	it('login guest admin', () => {
		logout();
		login(invitedEmail, userPassword);
		cy.url().should('eq', `${app_url}${selectors.dashboard.products}`);
		cy.get(selectors.productTitle).contains(
			selectors.dashboard.nameTestService
		);

		cy.get('nav').contains('Organisations').click();
		cy.get('p').contains(selectors.dashboard.nameTestOrga).should('be.visible');

		cy.get('nav').contains('Services').click();
		cy.get(selectors.productTitle)
			.contains(selectors.dashboard.nameTestService)
			.click();

		cy.wait(1000);

		cy.contains('Créer un formulaire').click();
		cy.get(selectors.modal.form)
			.first()
			.within(() => {
				cy.get('input[name="title"]').type('e2e-jdma-form-test', {
					force: true
				});
			});

		cy.get(selectors.modalFooter).contains('Créer').click();
		cy.visit(app_url);
	});

	// it('delete service with guest admin', () => {
	// 	logout();
	// 	login(invitedEmail, userPassword);
	// 	deleteService(selectors.dashboard.nameTestService);
	// 	checkMail(
	// 		false,
	// 		`Suppression du service « ${selectors.dashboard.nameTestService} » sur la plateforme « Je donne mon avis »`
	// 	);
	// 	checkform(false);
	// 	cy.visit(`${app_url}`);
	// 	cy.contains('div', selectors.dashboard.nameTestService).should('not.exist');
	// });

	// it('restore service with guest admin', () => {
	// 	logout();
	// 	login(invitedEmail, userPassword);
	// 	restaureService();
	// 	cy.get('input[name="archived-products"]').should('not.exist');
	// 	cy.contains('div', selectors.dashboard.nameTestService).should('exist');
	// 	checkMail(
	// 		false,
	// 		`Restauration du service « ${selectors.dashboard.nameTestService} » sur la plateforme « Je donne mon avis »`
	// 	);
	// 	checkform(true);
	// });
});

// Helpers

function loginAsAdmin() {
	login(adminEmail, adminPassword);
}

function login(email, password) {
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Se connecter').click();
}

const tryCloseNewsModal = () => {
	cy.wait(3000);
	cy.get('body').then($body => {
		const $modal = $body.find('dialog#news-modal');
		if ($modal.length && $modal.is(':visible')) {
			cy.wrap($modal).within(() => {
				cy.contains('button', 'Fermer').click();
			});
		} else {
			cy.log('News modal not found or not visible, skipping close action.');
		}
	});
};

function selectEntity() {
	cy.get('input#entity-select-autocomplete').click();
	cy.get('div[role="presentation"]')
		.find('#entity-select-autocomplete-option-0')
		.click();
}

function fillForm({
	firstName = 'John',
	lastName = 'Doe',
	password = '',
	email = ''
}) {
	cy.get('input[name="firstName"]').type(firstName, { force: true });
	cy.get('input[name="lastName"]').type(lastName);
	cy.get('input[type="password"]').type(password);
	if (email !== '') {
		cy.get('input[name="email"]').type(email);
	}
}

function deleteService(serviceName) {
	cy.contains('a', serviceName)
		.parents('div.fr-card')
		.within(() => {
			cy.get('#button-options-service').click();
		});
	cy.wait(1000);
	cy.contains('li', 'Supprimer ce service').click({ force: true });
	cy.contains('button', 'Supprimer').click({ force: true });
}

function restaureService() {
	cy.get('input[name="archived-products"]')
		.should('exist')
		.check({ force: true });
	cy.contains('div', selectors.dashboard.nameTestService).should('exist');
	cy.contains('button', 'Restaurer').should('exist').click();
	cy.get('.fr-modal__body').should('be.visible');
	cy.contains('button', 'Confirmer').click();
}

function logout() {
	cy.reload();
	cy.wait(2000);
	cy.get('header', { timeout: 10000 }).should('be.visible');
	cy.get('header').contains('Compte').click({ force: true });
	cy.contains('button', 'Se déconnecter').click({ force: true });
	cy.url().should('include', '/login');
}

function checkform(shouldWork = false) {
	cy.visit(`${app_form_url}/Demarches/4?button=7`, { failOnStatusCode: false });
	if (shouldWork) {
		cy.contains('h1', 'Je donne mon avis').should('exist');
		cy.contains('h1', 'Formulaire non trouvé').should('not.exist');
	} else {
		cy.contains('h1', 'Formulaire non trouvé').should('exist');
	}
}

function checkMail(click = false, topic = '') {
	cy.visit(mailer_url);
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

function getEmail() {
	cy.visit(mailer_url);
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

function clearInbox() {
	cy.visit(mailer_url);
	cy.get('.nav-pills').contains('Delete all messages').click();
	cy.get('.modal-footer').contains('Delete all messages').click();
}
