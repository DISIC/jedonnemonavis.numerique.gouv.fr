import { checkMail } from '../../../utils/helpers/admin';
import {
	createProduct,
	fillSignupForm,
	login,
	logout,
	tryCloseNewsModal
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
	before(() => {
		login(adminEmail, adminPassword, true);
		cy.injectAxe();
		cy.wait(500);
		cy.auditA11y();
		tryCloseNewsModal();
		cy.wait(500);
		cy.auditA11y();
		logout();
	});
	beforeEach(() => {
		login(adminEmail, adminPassword);
		cy.injectAxe();
	});

	it('check a11y news page', () => {
		cy.visit(`${appUrl}${selectors.dashboard.news}`);
		cy.injectAxe();
		cy.auditA11y();
	});

	it('create and delete users', () => {
		cy.visit(`${appUrl}${selectors.dashboard.users}`);
		cy.injectAxe();
		cy.wait(500);
		cy.auditA11y();

		for (let i = 0; i < 3; i++) {
			cy.contains('button', 'Ajouter un nouvel utilisateur')
				.should('be.visible')
				.click();
			if (i === 0) {
				cy.wait(500);
				cy.auditA11y();
			}
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
		cy.wait(500);
		cy.auditA11y();
		cy.get('input[name="word"]').type('supprimer');
		cy.contains('button', 'Supprimer').click();
		cy.get('input[type="checkbox"]').should('have.length', 2);
		cy.get('input[placeholder="Rechercher un utilisateur"]').clear();
		cy.contains('button', 'Rechercher').click();
		cy.get('input[type="checkbox"]').should('have.length', 8);
	});

	it('create organisation', () => {
		cy.visit(`${appUrl}${selectors.dashboard.entities}`);
		cy.injectAxe();
		cy.auditA11y();

		cy.get('[class*="DashBoardEntities"]')
			.contains('Ajouter une organisation')
			.click();

		cy.wait(500);
		cy.auditA11y();

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
		cy.injectAxe();

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
				cy.auditA11y();
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
		// TODO: add a11y checks when the new onboarding flows will be merged
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
		cy.get(selectors.productLink).contains(selectors.dashboard.nameTestService);

		cy.get('nav').contains('Organisations').click();
		cy.get('p').contains(selectors.dashboard.nameTestOrga).should('be.visible');

		cy.get('nav').contains('Services').click();
		cy.get(selectors.productLink)
			.contains(selectors.dashboard.nameTestService)
			.should('be.visible');
	});

	// TODO: reactivate these tests when it will be decided how to display archived products in the backoffice

	// it('delete service with guest admin', () => {
	// 	logout();
	// 	login(invitedEmailBis, userPassword);
	// 	deleteService(selectors.dashboard.nameTestService);
	// 	checkMail(
	// 		false,
	// 		`Suppression du service « ${selectors.dashboard.nameTestService} » sur la plateforme « Je donne mon avis »`
	// 	);
	// 	checkReviewForm(false);
	// 	cy.visit(`${appUrl}`);
	// 	cy.contains('div', selectors.dashboard.nameTestService).should('not.exist');
	// });

	// it('restore service with guest admin', () => {
	// 	logout();
	// 	login(invitedEmailBis, userPassword);
	// 	restaureService();
	// 	cy.get('input[name="archived-products"]').should('not.exist');
	// 	cy.contains('div', selectors.dashboard.nameTestService).should('exist');
	// 	checkMail(
	// 		false,
	// 		`Restauration du service « ${selectors.dashboard.nameTestService} » sur la plateforme « Je donne mon avis »`
	// 	);
	// 	checkReviewForm(true);
	// });
});
