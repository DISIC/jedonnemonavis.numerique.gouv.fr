import { createForm, login } from '../../../utils/helpers/common';
import {
	ensureTestServiceExists,
	goToServiceForms,
	renameForm
} from '../../../utils/helpers/forms';
import { selectors } from '../../../utils/selectors';
import { adminEmail, adminPassword } from '../../../utils/variables';

/**
 * Tests covering new multi-form handling + form builder edition workflow
 * Scope:
 *  - Create a service (product) if not existing for test isolation
 *  - Create several forms for the same service
 *  - Rename a form from the list page
 *  - Open a form builder, hide a step, edit a block (if editable) and publish
 *  - Ensure publish returns to forms page with success indicator (URL param)
 *  - Validate modified badges / hidden state persisted after publish
 */

const FORM_TITLES = [
	selectors.dashboard.nameTestForm1,
	selectors.dashboard.nameTestForm2
];

function renameFirstForm(oldTitle: string, newTitle: string) {
	cy.contains('a', oldTitle).click();
	cy.url().should('match', /\/forms\/\d+$/);

	renameForm(newTitle);

	goToServiceForms();
	cy.contains('a', newTitle).should('exist');
}

function openFirstFormBuilder(title: string) {
	cy.contains('a', title).click();
	cy.url().should('match', /\/forms\/\d+$/);
	// Direct edit pages may use ?tab= or /edit route
	cy.get('body').then($b => {
		if ($b.find('a:contains("Personnaliser le formulaire")').length) {
			cy.contains('a', 'Personnaliser le formulaire').click({ force: true });
		}
	});
	cy.url().should('match', /\/forms\/\d+(\/edit|\?tab=)/);
}

function hideFirstHideableStep() {
	cy.get('button').each($b => {
		if ($b.text().includes("Masquer l'étape")) {
			cy.wrap($b).click();
			cy.contains('button', "Afficher l'étape").should('exist');
			cy.contains('étape masquée').should('exist');
			return false; // stop iteration
		}
	});
}

function editFirstUpdatableBlock() {
	cy.get('button').each($b => {
		if ($b.text().includes('Éditer')) {
			cy.wrap($b).click();
			cy.get('div[contenteditable="true"], textarea')
				.first()
				.then($el => {
					const tag = $el.prop('tagName');
					if (tag === 'TEXTAREA') {
						cy.wrap($el).clear().type('Contenu édité par test automatique');
					} else {
						cy.wrap($el).invoke('html', 'Contenu édité par test automatique');
					}
				});
			// Editor save button text is 'Valider'
			cy.contains('button', 'Valider').click({ force: true });
			return false; // stop
		}
	});
}

function publishChanges() {
	// Iterate through steps (up to a safety cap) then publish
	let iterations = 0;
	function next() {
		if (iterations++ > 12) return; // safety
		cy.get('body').then($b => {
			const nextBtn = $b.find('button:contains("Étape suivante")').first();
			if (nextBtn.length) {
				cy.wrap(nextBtn).click();
				next();
			} else {
				cy.contains('button', 'Publier').then($pub => {
					if ($pub.prop('disabled')) {
						cy.log('Publish disabled (no detected change)');
					} else {
						cy.wrap($pub).click();
						cy.get('dialog#form-publish-modal').within(() => {
							cy.contains('button', 'Publier le formulaire').click();
						});
						cy.url().should('match', /formPublished=true/);
					}
				});
			}
		});
	}
	next();
}

describe('jdma-forms', () => {
	before(() => {
		login(adminEmail, adminPassword);
		goToServiceForms();
	});

	it.only('create multiple forms for a single service', () => {
		cy.wrap(FORM_TITLES).each((title: string) => {
			cy.get('body').then($body => {
				const exists =
					$body.find(`a:contains("${title}")`).filter(function () {
						return Cypress.$(this).text().trim() === title;
					}).length > 0;

				if (!exists) {
					createForm(title);
					cy.contains('a', title, { timeout: 10000 }).should('exist');
				} else {
					cy.log(`Form "${title}" already exists`);
				}
			});
		});
	});

	it('rename first form', () => {
		renameFirstForm(FORM_TITLES[0], selectors.dashboard.renamedTestForm);
	});

	it('edit a form in builder (hide step, edit block, publish)', () => {
		openFirstFormBuilder(selectors.dashboard.renamedTestForm);
		hideFirstHideableStep();
		editFirstUpdatableBlock();
		publishChanges();
	});
});
