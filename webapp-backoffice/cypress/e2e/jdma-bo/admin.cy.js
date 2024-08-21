const app_url = Cypress.env('app_base_url');
const adminEmail = 'e2e-jdma-test-admin@beta.gouv.fr';
const userPassword = Cypress.env('user_password');
const secretPassword = Cypress.env('get_tokenSecret');
const invitedEmail = 'e2e-jdma-test-invite@beta.gouv.fr';

describe('jdma-admin', () => {
	beforeEach(() => {
		//DELETE TEST USERS
		deleteTestUsers();
		createAdmin();
		cy.visit(app_url + '/login');
	});

	it('process admin', () => {
		cy.get('input[name="email"]').type(adminEmail);
		cy.get('[class*="LoginForm-button"]').contains('Continuer').click();
		cy.get('input[type="password"]').type(userPassword);
		cy.get('[class*="LoginForm-button"]').contains('Confirmer').click();
		cy.url().should('eq', app_url + '/administration/dashboard/products');

		cy.get('nav').find('li').contains('Organisations').click();
		cy.url().should('eq', app_url + '/administration/dashboard/entities');

		cy.get('[class*="DashBoardEntities"]')
			.find('button')
			.contains('Ajouter une organisation')
			.click();
		cy.get('dialog#entity-modal')
			.should('exist')
			.within(() => {
				cy.get('.fr-modal__body')
					.should('exist')
					.within(() => {
						cy.get('input[name="name"]').type('e2e-jdma-entity-test');
						cy.get('input[name="acronym"]').type('e2e-jdma-acronym-test');
						cy.get('.fr-modal__footer')
							.find('button')
							.contains('Créer une organisation')
							.click();
					});
			});

		cy.get('[id*="fr-alert"')
			.find('span')
			.contains('Inviter des collègues')
			.click();
		cy.get('dialog#entity-rights-modal')
			.should('exist')
			.within(() => {
				cy.get('.fr-modal__body')
					.should('exist')
					.within(() => {
						cy.get('input[name="email"]').type(invitedEmail);
						cy.get('button').contains('Inviter').click();
						cy.get('[id*="fr-alert"')
							.find('p')
							.contains(`Une invitation a été envoyée à ${invitedEmail}`);
						cy.get('[class*="entityCardWrapper"]')
							.find('span')
							.contains(invitedEmail)
							.should('be.visible');
					});
			});

		// REMOVE ADMIN
		// cy.get('[class*="actionBtn"]')
		// .find('button#button-options-access-right')
		// .click();
		// cy.get('li[role="menuitem"]')
		// 	.contains("Retirer comme administrateur de l'organisation")
		// 	.click();
		// cy.get('[class*="entityCardWrapper"]')
		// 	.find('span')
		// 	.contains(invitedEmail)
		// 	.should('not.be.visible');

		// PRODUCT
		cy.visit(app_url + '/administration/dashboard/products');
		cy.get('#product-modal-control-button')
			.contains('Ajouter un nouveau service')
			.click();
		cy.get('.fr-modal__body')
			.should('exist')
			.should('have.attr', 'data-fr-js-modal-body', 'true')
			.find('form#product-form')
			.should('exist')
			.within(() => {
				cy.get('input[name="title"]').type('e2e-jdma-service-test');
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
				cy.get('div[role="presentation"]')
					.find('[id="entity-select-autocomplete-option-0"]')
					.click();
				cy.get('input[name="urls.0.value"]').type('http://testurl1.com/');
			});
		cy.get('.fr-modal__footer')
			.contains('button', 'Ajouter ce service')
			.should('exist')
			.click();
		cy.wait(1500);
		cy.get('[class*="productTitle"]')
			.should('exist')
			.contains('e2e-jdma-service-test')
			.should('be.visible');

		//LOGOUT
		cy.get('header').find('button').contains('Déconnexion').click();
		cy.url().should('include', '/login');
		cy.visit(app_url + '/register');

		cy.get('input[name="email"]').should('exist').should('be.visible');

		fillForm({
			password: userPassword,
			email: invitedEmail
		});

		cy.get('button[type="submit"]').click();

		if (secretPassword) {
			const tryGetValidationEmail = maxAttempts => {
				let attempts = 0;

				const requestValidationEmail = () => {
					attempts += 1;
					return cy
						.request({
							method: 'GET',
							url: '/api/cypress-test/getValidationEmail',
							qs: {
								secretPassword: secretPassword
							},
							failOnStatusCode: false
						})
						.then(response => {
							if (response.status === 200) {
								const { email, link } = response.body;
								expect(email).to.equal(invitedEmail);
								return link;
							} else if (attempts < maxAttempts) {
								cy.wait(1000);
								return requestValidationEmail();
							} else {
								throw new Error('Validation email not received');
							}
						});
				};

				return requestValidationEmail();
			};
			tryGetValidationEmail(10).then(link => {
				cy.visit(link);
				cy.get('h2')
					.contains('Validation de votre compte')
					.should('be.visible');

				// LOGIN INVITED USER
				cy.visit(app_url + '/login');
				cy.get('input[name="email"]').type(invitedEmail);
				cy.get('[class*="LoginForm-button"]').contains('Continuer').click();
				cy.get('input[type="password"]').type(userPassword);
				cy.get('[class*="LoginForm-button"]').contains('Confirmer').click();
				cy.url().should('eq', app_url + '/administration/dashboard/products');
				cy.get('[class*="productTitle"]')
					.should('exist')
					.contains('e2e-jdma-service-test');
				cy.get('nav').find('li').contains('Organisations').click();
				cy.get('p')
					.contains('e2e-jdma-entity-test')
					.should('be.visible')
					.then(() => {
						// DELETE TEST USERS
						deleteTestUsers();
					});
				cy.visit(app_url);
			});
		}
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

function createAdmin() {
	cy.request({
		method: 'GET',
		url: app_url + '/api/cypress-test/createAdminUser',
		qs: {
			secretPassword: secretPassword
		}
	});
}

function deleteTestUsers() {
	cy.request({
		method: 'DELETE',
		url: app_url + '/api/cypress-test/deleteUsersAndProduct'
	}).then(response => {
		cy.log(response.body.message);
	});
}
