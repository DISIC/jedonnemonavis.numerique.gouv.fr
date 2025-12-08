import { selectors } from '../selectors';
import { createOrEditProduct } from './common';

export const tryCloseHelpModal = () => {
	cy.wait(1000);
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

export function ensureTestServiceExistsAndGoToForms() {
	cy.wait(500);
	cy.get('body').then($body => {
		const found = $body
			.find(`*:contains("${selectors.dashboard.nameTestService}")`)
			.filter(function () {
				return (
					Cypress.$(this).text().trim() === selectors.dashboard.nameTestService
				);
			});

		if (found.length === 0) {
			cy.log(
				`"${selectors.dashboard.nameTestService}" not found, creating resources...`
			);

			createOrEditProduct(selectors.dashboard.nameTestService);
		} else {
			cy.log(
				`"${selectors.dashboard.nameTestService}" exists, skipping creation`
			);
			cy.contains(selectors.productLink, selectors.dashboard.nameTestService)
				.should('be.visible')
				.click();
		}
	});
}

export function goToSettingsTabOfForm(isCurrentFormPage?: boolean) {
	if (isCurrentFormPage) {
		cy.contains('button', 'Paramètres').click();
	} else {
		cy.get(`a:contains("${selectors.dashboard.nameTestForm1}")`).then($link => {
			cy.visit($link.prop('href') + '?tab=settings');
		});
	}
}

export function goToLinksTabOfForm(isCurrentFormPage?: boolean) {
	if (isCurrentFormPage) {
		cy.contains('button', "Liens d'intégration").click();
	} else {
		cy.get(`a:contains("${selectors.dashboard.nameTestForm1}")`).then($link => {
			cy.visit($link.prop('href') + '?tab=links');
		});
	}
}

export function goToCurrentFormReviewPage(isCurrentFormPage?: boolean) {
	goToLinksTabOfForm(isCurrentFormPage);
	let copiedUrl = '';

	cy.window().then(win => {
		cy.wrap(
			cy.stub(win.navigator.clipboard, 'writeText').callsFake(text => {
				copiedUrl = text;
				return Promise.resolve();
			})
		).as('clipboardWrite');
	});

	cy.get('button#button-options').click();
	cy.contains('Copier').click();

	cy.get('@clipboardWrite').should('have.been.called');

	cy.then(() => {
		cy.log(`Visiting copied URL: ${copiedUrl}`);
		cy.visit(copiedUrl);
	});
}

export function editFormIntroductionText() {
	cy.contains('button', 'Éditer').click();
	cy.get('div[class*="editor"]')
		.clear()
		.type(selectors.formBuilder.modifiedIntroductionText);
	cy.contains('button', 'Valider').click();
}

export function publishForm() {
	cy.contains('button', 'Publier').click();
	cy.get(selectors.modal.publishForm)
		.should('be.visible')
		.within(() => {
			cy.get(selectors.modalFooter).contains('button', 'Confirmer').click();
		});
}
