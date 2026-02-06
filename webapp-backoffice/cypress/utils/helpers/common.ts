import { selectors } from '../selectors';
import { appFormUrl, appUrl, mailerUrl, invitedEmail } from '../variables';
import {
	editFormIntroductionText,
	ensureTestServiceExistsAndGoToForms
} from './forms';
import { addUserToProduct, editStep, skipStep } from './onboarding';

export function login(email: string, password: string, loginOnly = false) {
	cy.visit(`${appUrl}/login`);
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Se connecter').click();
	cy.wait(1000);
	cy.url().should('eq', `${appUrl}${selectors.url.products}`);
	tryFillUserDetailsForm();
	if (!loginOnly) tryCloseNewsModal();
}

export function logout() {
	cy.reload();
	tryCloseNewsModal();
	cy.get('header').should('be.visible');
	cy.get('header').contains('Compte').click({ force: true });
	cy.contains('button', 'Se déconnecter').click({ force: true });
	cy.url().should('include', '/login');
}

export function tryCloseNewsModal() {
	cy.wait(1000);
	cy.get('body').then($body => {
		const $modal = $body.find('dialog#news-modal');
		if ($modal.length && $modal.is(':visible')) {
			cy.wrap($modal).within(() => {
				cy.contains('button', 'Fermer').click();
			});
		} else {
			cy.log('News modal not found or not visible, skipping close action.');
		}
	});
}

export function tryCloseModal() {
	cy.wait(500);
	cy.get('body').then($body => {
		const $modal = $body.find('dialog[open]');
		if ($modal.length && $modal.is(':visible')) {
			cy.wrap($modal).within(() => {
				cy.contains('button', 'Fermer').click();
			});
		} else {
			cy.log('No open modal found, skipping close action.');
		}
	});
}

export function selectEntity() {
	cy.get('input#entity-select-autocomplete').click();
	cy.wait(500);
	cy.get('div[role="presentation"]')
		.should('be.visible')
		.find('[id="entity-select-autocomplete-option-0"]')
		.click();
}

export function addUrls(urls: string[]) {
	urls.forEach((url, index) => {
		if (index > 0) cy.contains('button', 'Ajouter un URL').click();
		cy.get(`input[name="urls.${index}.value"]`).type(url);
	});
}

export function fillSignupForm({
	firstName = 'John',
	lastName = 'Doe',
	email = '',
	password = ''
}) {
	const {
		firstName: firstNameSelector,
		lastName: lastNameSelector,
		email: emailSelector,
		password: passwordSelector
	} = selectors.signupForm;
	cy.get(firstNameSelector).type(firstName);
	cy.get(lastNameSelector).type(lastName);
	if (email !== '') cy.get(emailSelector).type(email);
	if (password !== '') cy.get(passwordSelector).type(password);
}

export const checkUrlRedirection = (selector: string, expectedUrl: string) => {
	cy.get(selector).click();
	cy.url().should('eq', appUrl + expectedUrl);
};

export function createOrEditProduct(
	name: string,
	isEdit = false,
	onlyProductCreation = false
) {
	if (!isEdit) {
		cy.injectAxe();
		cy.contains('button', /^Ajouter un (nouveau )?service$/).click();
		cy.wait(500);
		cy.auditA11y();
	}

	cy.get(selectors.productForm)
		.should('be.visible')
		.within(() => {
			cy.get('input[name="title"]').clear().type(name);
			selectEntity();
		});

	cy.get(selectors.onboarding.actionsContainer)
		.contains(
			'button',
			isEdit ? selectors.onboarding.save : selectors.onboarding.continue
		)
		.click({ force: true });

	if (onlyProductCreation) {
		cy.visit(`${appUrl}${selectors.url.products}`);
		cy.get('a[title="' + selectors.dashboard.nameTestService + '"]')
			.should('be.visible')
			.click({ force: true });
	}
}

export function createOrEditForm(
	name: string,
	isEdit = false,
	shouldCheckA11y = false,
	isOnboarding = true
) {
	if (!isEdit) {
		if (isOnboarding) {
			cy.contains('button', 'Générer un formulaire').click();
		} else {
			cy.url().should('include', '/administration/dashboard/product/');
			cy.contains('h1', 'service-test')
				.should('be.visible')
				.then(() => {
					cy.contains('button', 'Générer un formulaire').click();
				});
		}
	}

	cy.get(selectors.formCreation)
		.should('be.visible')
		.within(() => {
			if (shouldCheckA11y) {
				cy.injectAxe();
				cy.wait(500);
				cy.auditA11y();
			}
			cy.get('input[name="title"]')
				.should('be.visible')
				.and('not.be.disabled')
				.clear()
				.type(name);
		});

	const actions = selectors.onboarding.actionsContainer;

	cy.get(actions)
		.contains(
			'button',
			isEdit ? selectors.onboarding.save : selectors.onboarding.continue
		)
		.click();

	if (!isEdit) {
		cy.get(actions)
			.contains('button', selectors.onboarding.continue)
			.should('be.disabled');

		cy.get(actions).contains('button', selectors.onboarding.continue).click();
		cy.get(actions).contains('button', selectors.onboarding.continue).click();

		if (!isOnboarding) {
			cy.get(actions).contains('button', selectors.onboarding.continue).click();
			cy.get(actions).contains('button', selectors.onboarding.continue).click();
		}
	} else {
		editFormIntroductionText();
		cy.get(actions)
			.contains('button', selectors.onboarding.saveModifications)
			.click();
	}
}

export function createButton(name: string, shouldCheckA11y = false) {
	cy.intercept('POST', '/api/trpc/button.create*').as('createButton');
	cy.contains('button', "Créer un lien d'intégration").click({
		force: true
	});

	if (shouldCheckA11y) {
		cy.wait(500);
		cy.auditA11y();
	}

	cy.wait(1000);
	cy.get('input[name="button-create-title"]').clear().type(name);

	const actions = selectors.onboarding.actionsContainer;

	cy.get(actions).contains('button', 'Continuer').click();

	if (shouldCheckA11y) {
		cy.wait(500);
		cy.auditA11y();
	}

	// Stub clipboard to avoid "Document is not focused" error in CI
	cy.window().then(win => {
		cy.stub(win.navigator.clipboard, 'writeText').resolves();
	});

	cy.contains('button', 'Copier le code').first().click();

	cy.wait(200);

	cy.get('div.fr-alert').should('be.visible');

	cy.get(actions).contains('button', 'Continuer').click();

	cy.wait(500);

	cy.wait('@createButton').its('response.statusCode').should('eq', 200);
}

export function modifyButton() {
	cy.intercept('POST', '/api/trpc/button.update*').as('updateButton');
	cy.get('[class*="ProductButtonCard"]')
		.first()
		.within(() => {
			cy.get('[class*="actionsContainer"]')
				.find('button#button-options')
				.first()
				.click();
		});
	cy.get('div#option-menu').contains('Modifier').click();
	cy.get('dialog#button-modal').within(() => {
		cy.get('input[name="button-create-title"]')
			.clear()
			.type('e2e-jdma-button-test-1');
		cy.get('textarea')
			.clear()
			.type('Description du bouton e2e-jdma-button-test-1');
	});
	cy.get(selectors.modalFooter).contains('button', 'Modifier').click();
	cy.wait('@updateButton').its('response.statusCode').should('eq', 200);
}

export function checkMail(click = false, topic = '') {
	cy.visit(mailerUrl);
	cy.get('button[ng-click="refresh()"]').click();
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

export function checkReviewForm(shouldWork = false, url?: string) {
	cy.visit(url ?? `${appFormUrl}/Demarches/4?button=7`, {
		failOnStatusCode: false
	});
	if (shouldWork) {
		cy.contains('h1', 'Je donne mon avis').should('exist');
		cy.contains('h1', 'Formulaire non trouvé').should('not.exist');
	} else {
		cy.contains('h1', /Formulaire non trouvé|Ce formulaire est fermé/).should(
			'exist'
		);
	}
}

export function doTheOnboardingFlow() {
	cy.injectAxe();
	createOrEditProduct('e2e-jdma-service-test-1');
	editStep(selectors.onboarding.step.product);
	createOrEditProduct('e2e-jdma-service-test-1-edited', true);
	cy.wait(500);
	cy.auditA11y();
	skipStep(selectors.onboarding.step.access);
	editStep(selectors.onboarding.step.access);
	addUserToProduct(invitedEmail);
	createOrEditForm('form-test-1', false, true);
	editStep(selectors.onboarding.step.form);
	createOrEditForm('form-test-1-edited', true, false);
	createButton('e2e-jdma-button-test-1', true);
}

type UserDetailsFormInput = {
	jobTitle?: string;
	referralSource?: string;
	customReferralSource?: string;
	designLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
	submit?: boolean;
};

export function tryFillUserDetailsForm({
	jobTitle = 'Chef de projet',
	referralSource = 'Recherche Internet',
	customReferralSource = 'Recommandation',
	designLevel = 'beginner',
	submit = true
}: UserDetailsFormInput = {}) {
	cy.wait(500);
	cy.get('body').then($body => {
		const hasForm = $body.find('select[name="referralSource"]').length > 0;
		if (!hasForm) {
			cy.log('User details form not found, skipping fill action.');
			return;
		}

		cy.get('input[name="jobTitle"]').clear().type(jobTitle);
		cy.get('select[name="referralSource"]').select(referralSource);

		if (referralSource === 'Autre (précisez)') {
			cy.get('input[name="customReferralSource"]')
				.clear()
				.type(customReferralSource);
		}

		cy.get(`input[name="design-level-radio"][value="${designLevel}"]`).check({
			force: true
		});

		if (submit) {
			cy.contains('button', 'Continuer').click();
		}
	});
}
