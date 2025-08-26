import { checkMail } from '../../../utils/helpers/admin';
import {
	createForm,
	createProduct,
	fillSignupForm,
	login,
	logout
} from '../../../utils/helpers/common';
import { selectors } from '../../../utils/selectors';
import {
	adminEmail,
	adminPassword,
	appUrl,
	invitedEmailBis,
	userPassword
} from '../../../utils/variables';

describe('jdma-admin', () => {
	beforeEach(() => {
		login(adminEmail, adminPassword);
	});

	it('create and delete users', () => {
		cy.visit(`${appUrl}${selectors.dashboard.users}`);
		for (let i = 0; i < 3; i++) {
			cy.contains('button', 'Ajouter un nouvel utilisateur')
				.should('be.visible')
				.click();
			fillSignupForm({
				email: `test${i}@gmail.com`,
				password: userPassword,
				firstName: `Prénom ${i}`,
				lastName: `Nom ${i}`
			});
			cy.contains('button', 'Créer').click();
		}
		cy.get('input[placeholder="Rechercher un utilisateur"]').type('gmail');
		cy.contains('button', 'Rechercher').click();
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
		cy.get('.fr-card')
			.contains('p', selectors.dashboard.nameTestOrga)
			.should('exist');
	});

	it('invite admin on organisation', () => {
		cy.visit(`${appUrl}${selectors.dashboard.entities}`);
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
	});

	it('create service', () => {
		createProduct(selectors.dashboard.nameTestService);
		cy.visit(`${appUrl}`);
		cy.get(selectors.productLink)
			.should('exist')
			.then($productLink => {
				cy.wrap($productLink).contains(selectors.dashboard.nameTestService);
			});
	});

	it('register guest admin', () => {
		logout();
		checkMail(true, 'Invitation à rejoindre « Je donne mon avis »');
		fillSignupForm({ password: userPassword });
		cy.get('button').contains('Valider').click();
	});

	it('login guest admin', () => {
		logout();
		login(invitedEmailBis, userPassword);
		cy.url().should('eq', `${appUrl}${selectors.dashboard.products}`);
		cy.get(selectors.productLink).contains(selectors.dashboard.nameTestService);

		cy.get('nav').contains('Organisations').click();
		cy.get('p').contains(selectors.dashboard.nameTestOrga).should('be.visible');

		cy.get('nav').contains('Services').click();
		cy.get(selectors.productLink)
			.contains(selectors.dashboard.nameTestService)
			.click();

		createForm('e2e-jdma-form-test');
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
