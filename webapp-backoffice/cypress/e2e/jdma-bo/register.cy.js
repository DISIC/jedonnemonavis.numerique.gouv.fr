const app_url = 'http://localhost:3000';
const userPassword = Cypress.env('user_password');
const secretPassword = Cypress.env('get_tokenSecret');

function generateUniqueEmail() {
	const randomPart = Math.random().toString().slice(2, 12);
	const datePart = Date.now();
	return `e2e-jdma-test${randomPart}${datePart}@beta.gouv.fr`;
}
describe('jdma-register', () => {
	beforeEach(() => {
		cy.visit(app_url + '/register');
	});

	it('should display the signup form', () => {
		cy.get('input[name="firstName"]').should('be.visible');
		cy.get('input[name="lastName"]').should('be.visible');
		cy.get('input[name="email"]').should('be.visible');
		cy.get('input[type="password"]').should('be.visible');
		cy.get('button[type="submit"]').should('be.visible');
	});

	it('should not submit the form if the password is too short', () => {
		fillForm({ password: 'Short1!', email: 'john.doe@example.com' }); // Too short

		cy.get('button[type="submit"]').click();
		cy.get('.fr-messages-group').should('contain', '12 caractères minimum');
	});

	it('should not submit the form if the password lacks a special character', () => {
		fillForm({ password: 'Password1234', email: 'john.doe@example.com' }); // Missing special character

		cy.get('button[type="submit"]').click();
		cy.get('.fr-messages-group').should('contain', '1 caractère spécial');
	});

	it('should not submit the form if the password lacks a digit', () => {
		fillForm({ password: 'Password!@#', email: 'john.doe@example.com' }); // Missing digit

		cy.get('button[type="submit"]').click();
		cy.get('.fr-messages-group').should('contain', '1 chiffre minimum');
	});

	it('should submit the form WITH NOT whitelisted email', () => {
		fillForm({
			password: userPassword,
			email: 'test123num@jdma.com'
		});

		cy.get('button[type="submit"]').click();

		cy.url().then(currentUrl => {
			if (!currentUrl.includes('request=whitelist')) {
				cy.get('body').then(body => {
					if (body.find('.fr-alert--error').length > 0) {
						cy.get('.fr-alert--error')
							.should('exist')
							.and(
								'contain',
								'Il y a déjà un compte avec cette adresse email.'
							);
					} else {
						cy.get('h5').contains('Demande de création de compte');
					}
				});
			}
		});
	});

	it('should allow toggling password visibility', () => {
		cy.get('input.fr-password__input').type('mypassword');
		cy.get('label[for*="toggle-show"]').click();
		cy.get('input.fr-password__input').should('have.attr', 'type', 'text');
		cy.get('label[for*="toggle-show"]').click();
		cy.get('input.fr-password__input').should('have.attr', 'type', 'password');
	});

	it('should submit the form WITH whitelisted email', () => {
		const email = generateUniqueEmail();
		const password = userPassword;

		fillForm({ password: password, email });

		cy.get('button[type="submit"]').click();
		cy.wait(3000);

		cy.url().then(currentUrl => {
			if (currentUrl.includes('registered=classic')) {
				cy.log('New registration flow.');
				cy.wait(3000);
				cy.request({
					method: 'GET',
					url: '/api/test/getValidationEmail',
					qs: {
						secretPassword: secretPassword
					}
				}).then(response => {
					cy.wait(4000);
					const { email: responseEmail, link } = response.body;
					expect(responseEmail).to.equal(email);

					cy.visit(link);
					cy.wait(4000);
					cy.get('h2').contains('Validation de votre compte');

					// LOGIN
					cy.visit(app_url + '/login');
					cy.get('input[name="email"]').type(email);
					cy.get('[class*="LoginForm-button"]').contains('Continuer').click();
					cy.get('input[type="password"]').type(password);
					cy.get('[class*="LoginForm-button"]').contains('Confirmer').click();
					cy.url().should('eq', app_url + '/administration/dashboard/products');

					//TODO DELETE USER BY EMAIL
				});
			} else {
				cy.log('Existing email registration detected.');
				cy.get('body').then(body => {
					if (body.find('.fr-alert--error').length > 0) {
						cy.get('.fr-alert--error')
							.should('exist')
							.and(
								'contain',
								'Il y a déjà un compte avec cette adresse email.'
							);
					} else {
						cy.log('No error message found, possibly a different issue.');
					}
				});
			}
		});
	});
});

function fillForm({
	firstName = 'John',
	lastName = 'Doe',
	email = '',
	password = ''
}) {
	cy.get('input[name="firstName"]').type(firstName);
	cy.get('input[name="lastName"]').type(lastName);
	cy.get('input[name="email"]').type(email);
	cy.get('input[type="password"]').type(password);
}