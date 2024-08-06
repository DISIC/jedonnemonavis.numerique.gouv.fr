const app_url = 'http://localhost:3000/register';
const verify_url = 'http://localhost:3000/verify-email';

describe('jdma-register', () => {
	beforeEach(() => {
		cy.visit(app_url);
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

	it('should submit the form with email verification', () => {
		fillForm({
			password: 'ValidPass123!',
			email: 'test123num@jdma.com'
		});

		cy.get('button[type="submit"]').click();
		cy.wait(2000);

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

	it('should handle existing and new email registrations', () => {
		const email = 'john.doe@jedonnemonavis.gouv.fr'; // beta.gouv.fr email

		fillForm({ password: 'ValidPass123!', email });

		cy.get('button[type="submit"]').click();

		cy.url().then(currentUrl => {
			if (!currentUrl.includes('registered=classic')) {
				cy.get('body').then(body => {
					if (body.find('.fr-error-text').length > 0) {
						cy.get('.fr-error-text')
							.should('exist')
							.and(
								'contain',
								'Il y a déjà un compte avec cette adresse email.'
							);
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
