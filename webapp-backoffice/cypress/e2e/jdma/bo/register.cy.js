const app_url = Cypress.env('app_base_url');
const userPassword = Cypress.env('user_password');
const email = generateUniqueEmail();
const invitedEmail = Cypress.env('admin_guest_mail');
const mailer_url = Cypress.env('mailer_base_url');

describe('jdma-register', () => {
	beforeEach(() => {
		clearInbox();
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
		fillForm({ password: userPassword, email });

		cy.get('button[type="submit"]').click();
		cy.wait(3000);

		cy.url().then(currentUrl => {
			if (currentUrl.includes('registered=classic')) {
				cy.log('New registration flow.');

				cy.visit(mailer_url);
				cy.wait(5000);

				cy.get('div').find('.messages').click();
				cy.wait(3000);

				cy.get('ul.nav-tabs').find('a[href="#preview-plain"]').click();

				cy.get('ul.nav-tabs')
					.find('li.active')
					.should('contain.text', 'Plain text');

				cy.get('#preview-plain')
					.find('a')
					.each($link => {
						const href = $link.attr('href');
						if (href && href.includes('/register')) {
							cy.wrap($link).invoke('removeAttr', 'target').click();
							cy.wait(3000);
						}
					})
					.then(() => {
						// LOGIN
						cy.visit(app_url + '/login');
						cy.get('input[name="email"]').type(email);
						cy.get('[class*="LoginForm-button"]').contains('Continuer').click();
						cy.get('input[type="password"]').type(userPassword);
						cy.get('[class*="LoginForm-button"]').contains('Confirmer').click();
						cy.url().should(
							'eq',
							app_url + '/administration/dashboard/products'
						);
					});

				// PRODUCT
				cy.get('[class*="btnService"]').contains('Ajouter un service').click();
				cy.get('.fr-modal__body')
					.should('exist')
					.should('have.attr', 'data-fr-js-modal-body', 'true')
					.find('form#product-form')
					.should('exist')
					.within(() => {
						cy.get('input[name="title"]').type('e2e-jdma-service-test-1');

						cy.get('input#entity-select-autocomplete').click();

						cy.get('div[role="presentation"]')
							.should('be.visible')
							.then(() => {
								cy.get('input#entity-select-autocomplete').invoke(
									'attr',
									'aria-activedescendant',
									'entity-select-autocomplete-option-0'
								);
							});
					});
				cy.get('div[role="presentation"]')
					.find('[id="entity-select-autocomplete-option-0"]')
					.click();

				cy.get('input[name="urls.0.value"]').type('http://testurl1.com/');

				cy.contains('button', 'Ajouter un URL').click();

				cy.get('input[name="urls.1.value"]').type('http://testurl2.com/');

				cy.get('.fr-modal__footer')
					.contains('button', 'Ajouter ce service')
					.should('exist')
					.click();
				// cy.url().should('match', /\/buttons$/);
				cy.wait(3000);
				cy.get('[class*="ProductButtonsPage-btnContainer"]')
					.find('button')
					.contains('Créer un bouton JDMA')
					.should('exist')
					.click();
				cy.get('dialog#button-modal')
					.should('exist')
					.within(() => {
						cy.get('input[name="button-create-title"]')
							.should('exist')
							.type('bouton test 1');
						cy.get('textarea')
							.should('exist')
							.type('Description du bouton test 1');
					});

				cy.get('.fr-modal__footer')
					.contains('button', 'Créer')
					.should('exist')
					.click();

				cy.get('[class*="ProductButtonCard"]')
					.should('exist')
					.first()
					.within(() => {
						cy.get('p').contains('bouton test 1');

						cy.get('[class*="actionsContainer"]')
							.find('button#button-options')
							.click();
					});
				cy.get('div#option-menu')
					.find('li[role="menuitem"]')
					.contains('Modifier le bouton')
					.click();

				cy.get('dialog#button-modal')
					.should('exist')
					.within(() => {
						cy.get('input[name="button-create-title"]')
							.should('exist')
							.clear()
							.type('e2e-jdma-button-test-1');
						cy.get('textarea')
							.should('exist')
							.clear()
							.type('Description du bouton e2e-jdma-button-test-1');
					});
				cy.get('.fr-modal__footer')
					.contains('button', 'Modifier')
					.should('exist')
					.click();

				cy.get('[class*="ProductButtonCard"]')
					.should('exist')
					.first()
					.within(() => {
						cy.get('p').contains('e2e-jdma-button-test-1');
						cy.get('[class*="actionsContainer"]')
							.find('button')
							.contains('Installer')
							.click();
					});

				cy.get('dialog#button-modal', { timeout: 10000 })
					.should('exist')
					.find('.fr-modal__header')
					.find('button')
					.contains('Fermer')
					.click();

				cy.get('div[id*="fr-sidemenu"]')
					.find('li')
					.contains("Gérer l'accès")
					.click();

				//Gérer l'accès
				cy.get('button.ri-user-add-line')
					.should('be.visible')
					.contains('Inviter des administrateurs')
					.click();
				cy.wait(1000);
				cy.get('dialog[id="user-product-modal"]')
					.should('exist')
					.within(() => {
						cy.get('input').type(email);
						cy.get('button').contains('Inviter').click();
						cy.get('.fr-error-text')
							.should('exist')
							.contains(
								"L'utilisateur avec cet email fait déjà partie de ce service"
							)
							.should('exist');
						cy.get('input').clear();
						cy.get('input').type(invitedEmail);
						cy.get('button').contains('Inviter').click();
					});

				// // LOG OUT
				cy.get('header').find('button').contains('Déconnexion').click();
				cy.wait(3000);

				clearInbox();
				cy.wait(5000);

				cy.visit(app_url + '/register');

				fillForm({
					password: userPassword,
					email: invitedEmail
				});

				cy.get('button[type="submit"]').click();
				cy.wait(3000);

				cy.visit(mailer_url);
				cy.wait(6000);

				cy.get('div').find('.messages').click();
				cy.wait(3000);

				cy.get('ul.nav-tabs').find('a[href="#preview-plain"]').click();

				cy.get('ul.nav-tabs')
					.find('li.active')
					.should('contain.text', 'Plain text');

				cy.get('#preview-plain')
					.find('a')
					.each($link => {
						const href = $link.attr('href');
						if (href && href.includes('/register')) {
							cy.wrap($link).invoke('removeAttr', 'target').click();
						}
					})
					.then(() => {
						cy.url().should('include', '/register');
					});

				// 	// LOGIN INVITED USER
				cy.visit(app_url + '/login');
				cy.get('input[name="email"]').type(invitedEmail);
				cy.get('[class*="LoginForm-button"]').contains('Continuer').click();
				cy.get('input[type="password"]').type(userPassword);
				cy.get('[class*="LoginForm-button"]').contains('Confirmer').click();
				cy.url().should('eq', app_url + '/administration/dashboard/products');
				cy.get('[class*="productTitle"]')
					.should('exist')
					.contains('e2e-jdma-service-test-1');
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

			// // LOG OUT
			cy.get('header').find('button').contains('Déconnexion').click();
			cy.wait(3000);
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

function generateUniqueEmail() {
	const randomPart = Math.random().toString().slice(2, 12);
	const datePart = Date.now();
	return `e2e-jdma-test${randomPart}${datePart}@beta.gouv.fr`;
}

function clearInbox() {
	cy.visit(mailer_url);
	cy.get('.nav-pills').find('a').contains('Delete all messages').click();
	cy.get('.modal-footer')
		.find('button')
		.contains('Delete all messages')
		.click();
}
