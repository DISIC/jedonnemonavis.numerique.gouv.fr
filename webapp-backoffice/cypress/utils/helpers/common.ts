import { selectors } from '../selectors';
import { appUrl } from '../variables';

export function login(email: string, password: string) {
	cy.visit(`${appUrl}/login`);
	cy.get(selectors.loginForm.email).type(email);
	cy.get(selectors.loginForm.continueButton).contains('Continuer').click();
	cy.get(selectors.loginForm.password).type(password);
	cy.get(selectors.loginForm.continueButton).contains('Se connecter').click();
	cy.url().should('eq', `${appUrl}${selectors.dashboard.products}`);
	tryCloseNewsModal();
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
	cy.contains('button', /^Ajouter un (nouveau )?service$/).click();
	cy.get(selectors.productForm)
		.should('be.visible')
		.within(() => {
			cy.get('input[name="title"]').clear().type(name);
			selectEntity();
		});

	cy.get(selectors.onboarding.actionsContainer)
		.contains('button', 'Continuer')
		.click();
}

export function createForm(name: string) {
	cy.url().should('include', '/forms');
	cy.contains(
		'button',
		/^(?:Créer un nouveau ?formulaire|Générer un formulaire)$/
	).click();
	cy.get(selectors.modal.form)
		.should('be.visible')
		.within(() => {
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
