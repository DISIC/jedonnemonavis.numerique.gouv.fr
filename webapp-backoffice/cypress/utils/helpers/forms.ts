import { selectors } from '../selectors';
import { appUrl } from '../variables';
import { createProduct } from './common';

export const tryCloseHelpModal = () => {
	cy.get('body').then(body => {
		if (body.find('dialog#form-help-modal').length > 0) {
			cy.get('dialog#form-help-modal')
				.should('be.visible')
				.within(() => {
					cy.contains('button', 'Fermer').click();
				});
		} else {
			cy.log('Help modal not found, skipping close action.');
		}
	});
};

export function renameForm(newName: string) {
	cy.get('button').contains('Renommer').click();

	cy.get(selectors.modal.renameForm)
		.should('be.visible')
		.within(() => {
			cy.get('input[name="title"]').clear().type(newName);

			cy.get('button').contains('Modifier').click();
		});
}

export function ensureTestServiceExists() {
	cy.get('body').then($body => {
		const found = $body
			.find(`*:contains("${selectors.dashboard.nameTestService}")`)
			.filter(function () {
				return (
					Cypress.$(this).text().trim() === selectors.dashboard.nameTestService
				);
			});
		cy.log(`Found entries: ${found.length}`);

		if (found.length === 0) {
			cy.log(
				`"${selectors.dashboard.nameTestService}" not found, creating resources...`
			);
			createProduct(selectors.dashboard.nameTestService);
			cy.contains(selectors.dashboard.nameTestService, {
				timeout: 10000
			}).should('exist');
		} else {
			cy.log(
				`"${selectors.dashboard.nameTestService}" exists, skipping creation`
			);
		}
	});
}

export function goToServiceForms() {
	ensureTestServiceExists();
	cy.contains(selectors.productTitle, selectors.dashboard.nameTestService)
		.should('be.visible')
		.click();
}
