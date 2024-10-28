const app_url = Cypress.env('app_base_url');
const userPassword = Cypress.env('user_password');
const email = generateUniqueEmail();
const invitedEmail = Cypress.env('admin_guest_mail');
const mailer_url = Cypress.env('mailer_base_url');

// Sélecteurs communs
const selectors = {
	signupForm: {
		firstName: 'input[name="firstName"]',
		lastName: 'input[name="lastName"]',
		email: 'input[name="email"]',
		password: 'input[type="password"]',
		submitButton: 'button[type="submit"]'
	},
	errorMessages: '.fr-messages-group',
	passwordInput: 'input.fr-password__input',
	passwordToggle: 'label[for*="toggle-show"]',
	modalFooter: '.fr-modal__footer',
	productForm: '#product-form'
};

describe('jdma-register', () => {
	beforeEach(() => {
		cy.visit(`${app_url}/register`);
	});

	// Vérification du formulaire d'inscription
	it('should display the signup form', () => {
		checkSignupFormVisible();
	});

	// Validation des contraintes de mot de passe
	describe('Password validation', () => {
		it('should not submit the form if the password is too short', () => {
			testPasswordValidation({
				password: 'Short1!',
				message: '12 caractères minimum'
			});
		});

		it('should not submit the form if the password lacks a special character', () => {
			testPasswordValidation({
				password: 'Password1234',
				message: '1 caractère spécial'
			});
		});

		it('should not submit the form if the password lacks a digit', () => {
			testPasswordValidation({
				password: 'Password!@#',
				message: '1 chiffre minimum'
			});
		});
	});

	// Cas d'e-mail non whitelisté
	it('should submit the form WITH NOT whitelisted email', () => {
		testEmailSubmission(
			'test123num@jdma.com',
			'Il y a déjà un compte avec cette adresse email.',
			'Demande de création de compte'
		);
	});

	// Visibilité du mot de passe
	it('should allow toggling password visibility', () => {
		togglePasswordVisibility('mypassword');
	});

	// Cas d'e-mail whitelisté
	it('should submit the form WITH whitelisted email', () => {
		fillForm({ password: userPassword, email });

		cy.get(selectors.signupForm.submitButton).click();

		cy.url({ timeout: 10000 })
			.should('include', 'registered')
			.then(currentUrl => {
				if (currentUrl.includes('registered=classic')) {
					performPostRegistrationFlow(email);
				} else {
					checkExistingAccountError();
				}
			});
	});
});

// Helpers

function checkSignupFormVisible() {
	const { firstName, lastName, email, password, submitButton } =
		selectors.signupForm;
	cy.get(firstName).should('be.visible');
	cy.get(lastName).should('be.visible');
	cy.get(email).should('be.visible');
	cy.get(password).should('be.visible');
	cy.get(submitButton).should('be.visible');
}

function testPasswordValidation({ password, message }) {
	fillForm({ password, email: 'john.doe@example.com' });
	cy.get(selectors.signupForm.submitButton).click();
	cy.get(selectors.errorMessages).should('contain', message);
}

function togglePasswordVisibility(password) {
	cy.get(selectors.passwordInput).type(password);
	cy.get(selectors.passwordToggle).click();
	cy.get(selectors.passwordInput).should('have.attr', 'type', 'text');
	cy.get(selectors.passwordToggle).click();
	cy.get(selectors.passwordInput).should('have.attr', 'type', 'password');
}

function testEmailSubmission(email, errorMessage, successMessage) {
	fillForm({ password: userPassword, email });
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

function performPostRegistrationFlow(email) {
	getEmail();
	loginAndCreateProduct(email);
}

function loginAndCreateProduct(email) {
	cy.visit(`${app_url}/login`);
	cy.get('input[name="email"]').type(email);
	cy.get('[class*="LoginForm-button"]').contains('Continuer').click();
	cy.get('input[type="password"]').type(userPassword);
	cy.get('[class*="LoginForm-button"]').contains('Confirmer').click();
	cy.url().should('eq', `${app_url}/administration/dashboard/products`);

	createProduct();
}

function createProduct() {
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
	cy.get('[class*="ProductButtonsPage-btnContainer"]', {
		timeout: 10000
	}).should('be.visible');
	createAndModifyButton();
}

function selectEntity() {
	cy.get('input#entity-select-autocomplete').click();
	cy.get('div[role="presentation"]')
		.should('be.visible')
		.find('[id="entity-select-autocomplete-option-0"]')
		.click();
}

function addUrls(urls) {
	urls.forEach((url, index) => {
		if (index > 0) cy.contains('button', 'Ajouter un URL').click();
		cy.get(`input[name="urls.${index}.value"]`).type(url);
	});
}

function createAndModifyButton() {
	cy.get('[class*="ProductButtonsPage-btnContainer"]')
		.contains('Créer un bouton JDMA')
		.click();
	cy.get('dialog#button-modal').within(() => {
		cy.get('input[name="button-create-title"]').type('bouton test 1');
		cy.get('textarea').type('Description du bouton test 1');
	});
	cy.get(selectors.modalFooter).contains('button', 'Créer').click();
	modifyButton();
}

function modifyButton() {
	cy.get('[class*="ProductButtonCard"]')
		.first()
		.within(() => {
			cy.get('p').contains('bouton test 1');
			cy.get('[class*="actionsContainer"]')
				.find('button#button-options')
				.click();
		});
	cy.get('div#option-menu').contains('Modifier le bouton').click();
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

function checkExistingAccountError() {
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

function fillForm({
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
	cy.get(emailSelector).type(email);
	cy.get(passwordSelector).type(password);
}

function generateUniqueEmail() {
	const randomPart = Math.random().toString().slice(2, 12);
	const datePart = Date.now();
	return `e2e-jdma-test${randomPart}${datePart}@beta.gouv.fr`;
}

function logout() {
	cy.reload();
	cy.get('header', { timeout: 10000 }).should('be.visible');
	cy.get('header').contains('Compte').click({ force: true });
	cy.contains('button', 'Se déconnecter').click({ force: true });
	cy.url().should('include', '/login');
}

function getEmail() {
	cy.wait(5000);
	cy.visit(mailer_url);
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
