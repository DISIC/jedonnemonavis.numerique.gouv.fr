import { selectors } from '../selectors';
import {
	login,
	logout,
	tryCloseNewsModal,
	selectEntity,
	fillForm
} from '../helpers';
import {
	adminEmail,
	adminPassword,
	appFormUrl,
	appUrl,
	invitedEmailBis,
	mailerUrl,
	userPassword
} from '../variables';

describe('jdma-admin', () => {
	beforeEach(() => {
		cy.visit(`${appUrl}/login`);
		login(adminEmail, adminPassword);
		cy.url().should('eq', `${appUrl}${selectors.dashboard.products}`);
		cy.wait(1000);
		tryCloseNewsModal();
		cy.wait(1000);
	});

	it('create and delete users', () => {
		cy.visit(`${appUrl}${selectors.dashboard.users}`);
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
		cy.visit(`${appUrl}${selectors.dashboard.entities}`);

		cy.get('nav').contains('Organisations').click();
		cy.url().should('eq', `${appUrl}${selectors.dashboard.entities}`);

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

		cy.visit(`${appUrl}${selectors.dashboard.entities}`);
		cy.wait(1000);
		cy.get('.fr-card')
			.contains('p', selectors.dashboard.nameTestOrga)
			.should('exist');

		logout();
	});

	it('invite admin on organisation', () => {
		cy.visit(`${appUrl}${selectors.dashboard.entities}`);
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
				cy.get('input[name="email"]').type(invitedEmailBis);
				cy.get('button').contains('Inviter').click();
				cy.get('[class*="entityCardWrapper"]')
					.contains(invitedEmailBis)
					.should('be.visible');
			});
		checkMail(false, 'Invitation à rejoindre « Je donne mon avis »');
		cy.visit(`${appUrl}`);
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
		cy.visit(`${appUrl}`);
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
		login(invitedEmailBis, userPassword);
		cy.url().should('eq', `${appUrl}${selectors.dashboard.products}`);
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
		cy.visit(appUrl);
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

function deleteService(serviceName: string) {
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

function checkform(shouldWork = false) {
	cy.visit(`${appFormUrl}/Demarches/4?button=7`, { failOnStatusCode: false });
	if (shouldWork) {
		cy.contains('h1', 'Je donne mon avis').should('exist');
		cy.contains('h1', 'Formulaire non trouvé').should('not.exist');
	} else {
		cy.contains('h1', 'Formulaire non trouvé').should('exist');
	}
}

function checkMail(click = false, topic = '') {
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

function getEmail() {
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

function clearInbox() {
	cy.visit(mailerUrl);
	cy.get('.nav-pills').contains('Delete all messages').click();
	cy.get('.modal-footer').contains('Delete all messages').click();
}
