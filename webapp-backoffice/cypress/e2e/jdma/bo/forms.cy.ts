import {
	checkMail,
	checkReviewForm,
	createButton,
	createOrEditForm,
	login,
	modifyButton,
	tryCloseModal
} from '../../../utils/helpers/common';
import {
	checkAllTabsA11y,
	deleteForm,
	editFormIntroductionText,
	ensureTestServiceExistsAndGoToForms,
	goToCurrentFormReviewPage,
	goToTabOfForm,
	publishForm,
	renameForm
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
	let copiedReviewUrl = '';
	let helpModalA11yChecked = false;
	beforeEach(() => {
		login(adminEmail, adminPassword, false, helpModalA11yChecked);
		cy.injectAxe();
		ensureTestServiceExistsAndGoToForms();
		cy.injectAxe();
	});

	it('should create multiple forms for a single service', () => {
		cy.auditA11y();
		cy.wrap(FORM_TITLES).each((title: string, i: number) => {
			if (i > 0) {
				cy.visit(`${appUrl}${selectors.url.products}`);
				cy.get('a[title="' + selectors.dashboard.nameTestService + '"]')
					.should('be.visible')
					.click({ force: true });
			}
			cy.get('body').should('be.visible');
			cy.get('body').then($body => {
				const exists =
					$body.find(`a:contains("${title}")`).filter(function () {
						return Cypress.$(this).text().trim() === title;
					}).length > 0;

				if (!exists) {
					createOrEditForm(title, false, i === 0, false);
				} else {
					cy.log(`Form "${title}" already exists`);
				}
			});
		});

		cy.visit(`${appUrl}${selectors.url.products}`);
		cy.get('h3').should('exist');
		FORM_TITLES.forEach(title => {
			cy.contains('h3', title).should('be.visible');
		});
		cy.injectAxe();
		cy.auditA11y();
	});

	it('should pass a11y checks for each form tab', () => {
		checkAllTabsA11y();
	});

	it('should create and modify a button from the forms page', () => {
		goToTabOfForm('links');
		createButton("Lien d'intégration 1", false, 'button');
		modifyButton();
	});

	it('should go to form review url from button copy then create a form review on first version of the first form', () => {
		goToCurrentFormReviewPage().then(url => {
			copiedReviewUrl = url;
			cy.writeFile('cypress/fixtures/dynamicTestData.json', {
				formReviewUrl: url
			});
		});
		cy.wait(1000);
		fillFormStep1(false, true);
		fillFormStep2(true);
		fillFormStep3(true);
		fillFormStep4(true);
	});

	it('should check a11y in form builder', () => {
		goToTabOfForm('settings');
		cy.contains('button', 'Éditer le formulaire').click();
		cy.injectAxe();
		tryCloseModal(true);
		helpModalA11yChecked = true;
		cy.wait(500);
		cy.auditA11y();
		cy.contains('button', 'Étape suivante').click();
		cy.auditA11y();
		cy.contains('button', 'Étape suivante').click();
		cy.auditA11y();
		cy.contains('button', 'Étape suivante').click();
	});

	it('should edit a form in builder (hide step, edit block, publish) and check changes from dashboard and on form review page', () => {
		goToTabOfForm('settings');
		cy.contains('button', 'Éditer le formulaire').click();
		cy.injectAxe();
		tryCloseModal();
		editFormIntroductionText();
		cy.contains('button', 'Étape suivante').click();
		cy.contains('button', "Masquer l'étape").click();
		publishForm();
		cy.get('[role="tabpanel"]')
			.first()
			.should('not.contain', 'Simplicité du langage');
		goToCurrentFormReviewPage({ isCurrentFormPage: true });
		fillFormStep1(true);
	});

	it('should pass a11y checks for each form tab with data', () => {
		checkAllTabsA11y(true);
	});

	it('should rename form', () => {
		goToTabOfForm('settings');
		cy.contains('button', 'Éditer le formulaire').click();
		cy.injectAxe();
		tryCloseModal();
		renameForm(selectors.dashboard.renamedTestForm);
		cy.visit(`${appUrl}${selectors.url.products}`);
		ensureTestServiceExistsAndGoToForms();
		cy.contains('a', selectors.dashboard.renamedTestForm).should('exist');
	});

	it('should delete a form and his links', () => {
		goToTabOfForm('settings', { isRenamed: true });
		cy.injectAxe();
		deleteForm();
		checkMail(
			false,
			`Fermeture du formulaire «${selectors.dashboard.renamedTestForm}» du service «${selectors.dashboard.nameTestService}»`
		);
		cy.readFile('cypress/fixtures/dynamicTestData.json').then(data => {
			checkReviewForm(false, data.formReviewUrl);
		});
	});
});
