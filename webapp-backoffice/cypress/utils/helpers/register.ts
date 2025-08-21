import { selectors } from '../selectors';
import { appUrl, mailerUrl, userPassword } from '../variables';
import { addUrls, fillSignupForm, selectEntity } from './common';

export function checkSignupFormVisible() {
	const { firstName, lastName, email, password, submitButton } =
		selectors.signupForm;
	cy.get(firstName).should('be.visible');
	cy.get(lastName).should('be.visible');
	cy.get(email).should('be.visible');
	cy.get(password).should('be.visible');
	cy.get(submitButton).should('be.visible');
}

export function testPasswordValidation({
	password,
	message
}: {
	password: string;
	message: string;
}) {
	fillSignupForm({ password, email: 'john.doe@example.com' });
	cy.get(selectors.signupForm.submitButton).click();
	cy.get(selectors.errorMessages).should('contain', message);
}

export function togglePasswordVisibility(password: string) {
	cy.get(selectors.passwordInput).type(password);
	cy.get(selectors.passwordToggle).click();
	cy.get(selectors.passwordInput).should('have.attr', 'type', 'text');
	cy.get(selectors.passwordToggle).click();
	cy.get(selectors.passwordInput).should('have.attr', 'type', 'password');
}

export function testEmailSubmission(
	email: string,
	errorMessage: string,
	successMessage: string
) {
	fillSignupForm({ password: userPassword, email });
	cy.get(selectors.signupForm.submitButton).click();

	cy.url().then(currentUrl => {
		if (!currentUrl.includes('request=whitelist')) {
			cy.get('body').then(body => {
				if (body.find('.fr-alert--error').length > 0) {
					cy.get('.fr-alert--error')
						.should('exist')
						.and('contain', errorMessage);
				} else {
					cy.get('h5').contains(successMessage);
				}
			});
		}
	});
}

export function performPostRegistrationFlow(email: string) {
	getEmail();
	loginAndCreateProduct(email);
}

export function loginAndCreateProduct(email: string) {
	cy.visit(`${appUrl}/login`);
	cy.get('input[name="email"]').type(email);
	cy.get('[class*="LoginForm-button"]').contains('Continuer').click();
	cy.get('input[type="password"]').type(userPassword);
	cy.get('[class*="LoginForm-button"]').contains('Se connecter').click();
	cy.url().should('eq', `${appUrl}/administration/dashboard/products`);

	createProduct();
}

export function createProduct() {
	cy.contains('button', 'Ajouter un service').click();
	cy.get(selectors.productForm, { timeout: 10000 })
		.should('be.visible')
		.within(() => {
			cy.get('input[name="title"]').type('e2e-jdma-service-test-1');
			selectEntity();
			addUrls(['http://testurl1.com/', 'http://testurl2.com/']);
		});

	cy.get(selectors.modalFooter)
		.contains('button', 'Ajouter ce service')
		.click();
	createAndModifyForm();
}

export function createAndModifyForm() {
	cy.get('[class*="buttonContainer"]').contains('Créer un formulaire').click();
	cy.get('dialog#new-form-modal').within(() => {
		cy.get('input[name="title"]').type('form test 1');
	});
	cy.get(selectors.modalFooter)
		.contains('button', 'Créer')
		.click({ force: true });

	cy.wait(3000);

	// TODO : create button & edit form
}

export function renameForm() {
	cy.get('button').contains('Renommer').click();

	cy.get('dialog#rename-form-modal')
		.should('be.visible')
		.within(() => {
			cy.get('input[name="title"]').clear().type('e2e-jdma-form-test-renamed');

			cy.get('button').contains('Modifier').click();
		});
}

const tryCloseHelpModal = () => {
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

export function modifyButton() {
	cy.get('[class*="ProductButtonCard"]')
		.first()
		.within(() => {
			cy.get('p').contains('bouton test 1');
			cy.get('[class*="actionsContainer"]')
				.find('button#button-options')
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
}

export function checkExistingAccountError() {
	cy.get('body').then(body => {
		if (body.find('.fr-alert--error').length > 0) {
			cy.get('.fr-alert--error')
				.should('exist')
				.and('contain', 'Il y a déjà un compte avec cette adresse email.');
		} else {
			cy.log('No error message found, possibly a different issue.');
		}
	});
}

export function generateUniqueEmail() {
	const randomPart = Math.random().toString().slice(2, 12);
	const datePart = Date.now();
	return `e2e-jdma-test${randomPart}${datePart}@beta.gouv.fr`;
}

export function getEmail() {
	cy.wait(2000);
	cy.visit(mailerUrl);
	cy.get('button.btn-default[title="Refresh"]').click();
	cy.get('div.messages', { timeout: 20000 })
		.find('div.msglist-message')
		.first()
		.click();
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
