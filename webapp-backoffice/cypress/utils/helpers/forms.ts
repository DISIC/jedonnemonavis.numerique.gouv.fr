import { selectors } from '../selectors';
import { createOrEditProduct } from './common';

type FormTab = 'dashboard' | 'reviews' | 'stats' | 'links' | 'settings';

type GoToTabFormProps = {
	isCurrentFormPage?: boolean;
	isRenamed?: boolean;
	shouldCheckA11y?: boolean;
};

const TAB_LABELS: Record<FormTab, string> = {
	dashboard: 'Tableau de bord',
	reviews: 'Réponses',
	stats: 'Statistiques',
	links: "Liens d'intégration",
	settings: 'Paramètres'
};

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

			createOrEditProduct(selectors.dashboard.nameTestService, false, true);
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

export function goToTabOfForm(tab: FormTab, props: GoToTabFormProps = {}) {
	const { isCurrentFormPage, isRenamed } = props;

	if (isCurrentFormPage) {
		cy.contains('button', TAB_LABELS[tab]).click();
	} else {
		const formTitle = isRenamed
			? selectors.dashboard.renamedTestForm
			: selectors.dashboard.nameTestForm1;

		cy.get(`a:contains("${formTitle}")`).then($link => {
			const baseUrl = $link.prop('href');
			const urlWithTab =
				tab === 'dashboard' ? baseUrl : `${baseUrl}?tab=${tab}`;
			cy.visit(urlWithTab);
		});
	}
}

export function goToCurrentFormReviewPage(
	props: GoToTabFormProps = {}
): Cypress.Chainable<string> {
	const { isCurrentFormPage } = props;

	goToTabOfForm('links', { isCurrentFormPage });
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

	return cy
		.then(() => copiedUrl)
		.then(url => {
			cy.log(`Visiting copied URL: ${url}`);
			cy.visit(url);
			return cy.wrap(url);
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

export function deleteForm() {
	cy.contains('button', 'Fermer le formulaire').click({ force: true });
	cy.wait(500);
	cy.auditA11y();
}

export function checkAllTabsA11y() {
	Object.keys(TAB_LABELS).forEach((tab: FormTab, i: number) => {
		goToTabOfForm(tab, { isCurrentFormPage: i !== 0 });
		if (i === 0) cy.injectAxe();
		cy.wait(10000); // to replace with a better timeout
		cy.auditA11y(undefined, { withDetails: true });
	});
}
