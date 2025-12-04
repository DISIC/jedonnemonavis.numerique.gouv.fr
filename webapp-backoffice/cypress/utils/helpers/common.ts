import { selectors } from '../selectors';
import { appFormUrl, appUrl, mailerUrl } from '../variables';

export function login(email: string, password: string, loginOnly = false) {
	cy.visit(`${appUrl}/login`);
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Se connecter').click();
	cy.url().should('eq', `${appUrl}${selectors.dashboard.products}`);
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
	cy.wait(500);
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

export function createProduct(name: string) {
	// TODO: add a11y checks when the new onboarding flows will be merged
	cy.contains('button', /^Ajouter un (nouveau )?service$/).click();
	cy.wait(500);
	cy.auditA11y();
	cy.get(selectors.productForm)
		.should('be.visible')
		.within(() => {
			cy.get('input[name="title"]').clear().type(name);
			selectEntity();
			addUrls(['http://testurl1.com/', 'http://testurl2.com/']);
		});

	cy.get(selectors.modalFooter)
		.contains('button', 'Ajouter ce service')
		.click();
}

export function createForm(name: string, shouldCheckA11y = false) {
	cy.url().should('include', '/forms');
	cy.contains(
		'button',
		/^(?:Créer un nouveau ?formulaire|Générer un formulaire)$/
	).click();

	cy.get(selectors.modal.form)
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
	cy.get(selectors.modalFooter).contains('button', 'Créer').click();
}

export function createButton(name: string) {
	cy.intercept('POST', '/api/trpc/button.create*').as('createButton');
	cy.contains('button', "Créer un lien d'intégration").click();
	cy.get(selectors.modal.button)
		.should('be.visible')
		.within(() => {
			cy.get('input[name="button-create-title"]').clear().type(name);
		});
	cy.get(selectors.modalFooter).contains('button', 'Créer').click();
	cy.wait('@createButton').its('response.statusCode').should('eq', 200);
	tryCloseModal();
}

export function modifyButton() {
	cy.intercept('POST', '/api/trpc/button.update*').as('updateButton');
	cy.get('[class*="ProductButtonCard"]')
		.first()
		.within(() => {
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
