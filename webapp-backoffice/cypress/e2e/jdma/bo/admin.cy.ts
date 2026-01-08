import { deleteAccount } from '../../../utils/helpers/account';
import { checkMail } from '../../../utils/helpers/admin';
import {
	createOrEditProduct,
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
		cy.visit(`${appUrl}${selectors.url.users}`);
		cy.contains('button', 'Ajouter un nouvel utilisateur')
			.should('be.visible')
			.click();
		fillSignupForm({
			email: `test@gmail.com`,
			password: userPassword,
			firstName: `Prénom`,
			lastName: `Nom`
		});
		cy.contains('button', 'Créer').click();
		cy.get('input[placeholder="Rechercher un utilisateur"]').type('gmail');
		cy.contains('button', 'Rechercher').click();
		cy.get('.fr-card')
			.filter((_, card) => card.textContent?.includes('@gmail.com'))
			.should('have.length', 1);
		cy.contains('a', 'Prénom Nom').click({
			force: true
		});
		deleteAccount();
		cy.wait(500);
		cy.get('.fr-card').should('not.exist');
		cy.get('input[placeholder="Rechercher un utilisateur"]').clear();
		cy.contains('button', 'Rechercher').click();
		cy.get('.fr-card').should('have.length', 5);
	});

	it('create organisation', () => {
		cy.visit(`${appUrl}${selectors.url.entities}`);

		cy.get('nav').contains('Organisations').click();
		cy.url().should('eq', `${appUrl}${selectors.url.entities}`);

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

		cy.visit(`${appUrl}${selectors.url.entities}`);
		cy.get('.fr-card')
			.contains('p', selectors.dashboard.nameTestOrga)
			.should('exist');
	});

	it('invite admin on organisation', () => {
		cy.visit(`${appUrl}${selectors.url.entities}`);
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
		createOrEditProduct(selectors.dashboard.nameTestService);
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
		cy.url().should('eq', `${appUrl}${selectors.url.products}`);
		cy.get(selectors.productLink).contains(selectors.dashboard.nameTestService);

		cy.get('nav').contains('Organisations').click();
		cy.get('p').contains(selectors.dashboard.nameTestOrga).should('be.visible');

		cy.get('nav').contains('Services').click();
		cy.get(selectors.productLink)
			.contains(selectors.dashboard.nameTestService)
			.should('be.visible');
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
