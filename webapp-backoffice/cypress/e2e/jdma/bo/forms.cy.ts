import { createButton, createForm, login } from '../../../utils/helpers/common';
import {
	editFormIntroductionText,
	ensureTestServiceExistsAndGoToForms,
	goToCurrentFormReviewPage,
	goToSettingsTabOfForm,
	publishForm,
	renameForm,
	tryCloseHelpModal
} from '../../../utils/helpers/forms';
import {
	fillFormStep1,
	fillFormStep2,
	fillFormStep3,
	fillFormStep4
} from '../../../utils/helpers/review';
import { selectors } from '../../../utils/selectors';
import { adminEmail, adminPassword, appUrl } from '../../../utils/variables';

const FORM_TITLES = [
	selectors.dashboard.nameTestForm1,
	selectors.dashboard.nameTestForm2
];

describe('jdma-forms', () => {
	beforeEach(() => {
		login(adminEmail, adminPassword);
		ensureTestServiceExistsAndGoToForms();
	});

	it('should create multiple forms for a single service', () => {
		cy.wrap(FORM_TITLES).each((title: string) => {
			cy.get('body').then($body => {
				const exists =
					$body.find(`a:contains("${title}")`).filter(function () {
						return Cypress.$(this).text().trim() === title;
					}).length > 0;

				if (!exists) {
					createForm(title);
					cy.contains('a', title).should('exist');
				} else {
					cy.log(`Form "${title}" already exists`);
				}
			});
		});
	});

	it('should create a button from the forms page', () => {
		createButton('Emplacement 1');
	});

	it('should go to form review url from button copy then create a form review on first version of the first form', () => {
		goToCurrentFormReviewPage();
		fillFormStep1();
		fillFormStep2();
		fillFormStep3();
		fillFormStep4();
	});

	it('should edit a form in builder (hide step, edit block, publish) and check changes from dashboard and on form review page', () => {
		goToSettingsTabOfForm();
		cy.contains('button', 'Éditer le formulaire').click();
		tryCloseHelpModal();
		editFormIntroductionText();
		cy.contains('button', 'Étape suivante').click();
		cy.contains('button', "Masquer l'étape").click();
		publishForm();
		cy.get('[role="tabpanel"]')
			.first()
			.should('not.contain', 'Simplicité du langage');
		goToCurrentFormReviewPage(true);
		fillFormStep1(true);
	});

	it('should rename form', () => {
		goToSettingsTabOfForm();
		cy.contains('button', 'Éditer le formulaire').click();
		tryCloseHelpModal();
		renameForm(selectors.dashboard.renamedTestForm);
		cy.visit(`${appUrl}${selectors.dashboard.products}`);
		ensureTestServiceExistsAndGoToForms();
		cy.contains('a', selectors.dashboard.renamedTestForm).should('exist');
	});
});
