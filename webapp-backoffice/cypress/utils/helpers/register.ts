import { selectors } from '../selectors';
import { mailerUrl, userPassword } from '../variables';
import { createForm, createProduct, fillSignupForm, login } from './common';

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
	login(email, userPassword);
	createProduct('e2e-jdma-service-test-1');
	createForm('form-test-1');
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
	cy.visit(mailerUrl);
	cy.get('button.btn-default[title="Refresh"]').click();
	cy.get('div.messages').find('div.msglist-message').first().click();
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
