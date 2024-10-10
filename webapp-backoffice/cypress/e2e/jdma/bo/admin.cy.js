const app_url = Cypress.env('app_base_url');
const adminEmail = Cypress.env('admin_user_mail');
const adminPassword = Cypress.env('admin_user_password');
const userPassword = Cypress.env('user_password');
const mailer_url = Cypress.env('mailer_base_url');
const invitedEmail = Cypress.env('admin_guest_mail_bis');

describe('jdma-admin', () => {
	beforeEach(() => {
		cy.visit(app_url + '/login');
		cy.wait(5000);
		cy.get('input[name="email"]').type(adminEmail);
		cy.get('[class*="LoginForm-button"]')
			.contains('Continuer')
			.click()
			.then(() => {
				cy.wait(4000);
				cy.get('input[type="password"]').type(adminPassword);
			});
		cy.get('[class*="LoginForm-button"]')
			.contains('Confirmer')
			.click()
			.then(() => {
				cy.url().should('eq', app_url + '/administration/dashboard/products');
			});
		cy.wait(4000);
	});

	it('create organisation', () => {
		clearInbox();
		cy.wait(5000);
		cy.visit(app_url + '/administration/dashboard/entities');

		cy.get('nav')
			.find('li')
			.contains('Organisations')
			.click()
			.then(() => {
				cy.url().should('eq', app_url + '/administration/dashboard/entities');
			});

		cy.get('[class*="DashBoardEntities"]')
			.find('button')
			.contains('Ajouter une organisation')
			.click();

		cy.wait(3000);
		cy.get('dialog#entity-modal')
			.should('exist')
			.and('be.visible')
			.within(() => {
				cy.get('.fr-modal__body')
					.should('exist')
					.and('be.visible')
					.within(() => {
						cy.get('input[name="name"]')
							.should('be.visible')
							.type('e2e-jdma-entity-test', { force: true });

						cy.get('input[name="acronym"]')
							.should('be.visible')
							.type('e2e-jdma-acronym-test', { force: true });

						cy.get('.fr-modal__footer')
							.find('button')
							.contains('Créer une organisation')
							.should('be.visible')
							.click({ force: true });
						cy.wait(5000);
					});
			});

		cy.get('.fr-card')
			.last()
			.within(() => {
				cy.contains('button', 'Gérer les administrateurs').click({
					force: true
				});
			});

		cy.get('dialog#entity-rights-modal')
			.should('exist')
			.within(() => {
				cy.get('.fr-modal__body')
					.should('exist')
					.within(() => {
						cy.get('input[name="email"]').type(invitedEmail);
						cy.get('button')
							.contains('Inviter')
							.click()
							.then(() => {
								// cy.get('[id*="fr-alert"')
								// 	.find('p')
								// 	.contains(`Une invitation a été envoyée à ${invitedEmail}`);
								cy.get('[class*="entityCardWrapper"]')
									.find('span')
									.contains(invitedEmail)
									.should('be.visible');
							});
					});
			});

		logout();
	});

	it('create service', () => {
		cy.get('#product-modal-control-button')
			.contains('Ajouter un nouveau service')
			.click();
		cy.wait(8000);
		cy.get('dialog#product-modal')
			.invoke('css', 'visibility', 'visible')
			.invoke('css', 'opacity', 1)
			.should('be.visible')
			.within(() => {
				cy.get('.fr-modal__body').within(() => {
					cy.get('input[name="title"]')
						.should('be.visible')
						.type('e2e-jdma-service-test');
					cy.wait(2000);
					cy.get('input#entity-select-autocomplete', { timeout: 10000 })
						.should('be.visible')
						.click();
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
			});

		cy.get('.fr-modal__footer')
			.contains('button', 'Ajouter ce service')
			.should('exist')
			.click();
		cy.get('dialog#product-modal')
			.invoke('css', 'visibility', 'hidden')
			.invoke('css', 'opacity', 0);
		cy.wait(1500);
		cy.get('[class*="productTitle"]')
			.should('exist')
			.contains('e2e-jdma-service-test')
			.should('be.visible');

		cy.wait(1000);
	});

	it('invite email', () => {
		getEmail();
	});

	it('register guest admin', () => {
		logout();
		cy.visit(app_url + '/register');
		cy.wait(5000);
		cy.get('[class*="formContainer"]');

		fillForm({ email: invitedEmail, password: userPassword });
		cy.get('button').contains('Valider').click();
		cy.wait(3000);
	});

	it('confirm email', () => {
		getEmail();
	});

	it('login guest admin', () => {
		logout();
		cy.visit(app_url + '/login');
		cy.wait(5000);
		cy.get('input[name="email"]').type(invitedEmail);
		cy.get('[class*="LoginForm-button"]').contains('Continuer').click();
		cy.get('input[type="password"]').type(userPassword);
		cy.get('[class*="LoginForm-button"]').contains('Confirmer').click();
		cy.url().should('eq', app_url + '/administration/dashboard/products');
	});

	it('check existing service', () => {
		cy.get('[class*="productTitle"]')
			.should('exist')
			.contains('e2e-jdma-service-test');

		cy.get('nav').find('li').contains('Organisations').click();
		cy.get('p').contains('e2e-jdma-entity-test').should('be.visible');
	});

	it('create button', () => {
		cy.get('nav').find('li').contains('Services').click();

		cy.get('[class*="productTitle"]')
			.should('exist')
			.contains('e2e-jdma-service-test')
			.click();

		cy.get('button').contains('Créer un bouton JDMA').should('exist').click();
		cy.wait(2000);
		cy.get('dialog#button-modal')
			.should('exist')
			.within(() => {
				cy.get('input[name="button-create-title"]')
					.should('exist')
					.type('e2e-jdma-button-test');
				cy.get('textarea')
					.should('exist')
					.type('Description du bouton e2e-jdma-button-test');
			});
		cy.get('.fr-modal__footer')
			.contains('button', 'Créer')
			.should('exist')
			.click();
		cy.visit(app_url);
	});
});

function fillForm({
	firstName = 'John',
	lastName = 'Doe',
	password = '',
	email = ''
}) {
	cy.get('input[name="firstName"]').type(firstName);
	cy.get('input[name="lastName"]').type(lastName);
	cy.get('input[name="email"]').type(email);
	cy.get('input[type="password"]').type(password);
}

function logout() {
	cy.get('header')
		.find('button')
		.contains('Déconnexion')
		.click({ force: true });
	cy.wait(5000);
}

function getEmail() {
	logout();

	cy.visit(mailer_url);
	cy.wait(10000);

	cy.reload();
	cy.wait(5000);

	cy.get('div.messages')
		.should('exist')
		.and('be.visible')
		.should('be.visible')
		.and('not.be.empty')
		.scrollIntoView()
		.find('div.msglist-message')
		.first()
		.click({ force: true });
	cy.wait(4000);

	cy.get('ul.nav-tabs').find('a[href="#preview-plain"]').click();

	cy.get('ul.nav-tabs').find('li.active').should('contain.text', 'Plain text');

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
			cy.wait(2000);
		});
	clearInbox();
}

function clearInbox() {
	cy.visit(mailer_url);
	cy.wait(4000);
	cy.get('.nav-pills').find('a').contains('Delete all messages').click();
	cy.get('.modal-footer')
		.find('button')
		.contains('Delete all messages')
		.click();
}
