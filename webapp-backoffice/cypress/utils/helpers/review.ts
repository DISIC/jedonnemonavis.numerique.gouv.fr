import { adminEmail, adminPassword, appUrl } from '../variables';
import { login } from './common';

export function fillFormStep1() {
	cy.get('[class*="formSection"]').within(() => {
		cy.get('h1').contains('Je donne mon avis');
		cy.get('[class*="smileysContainer"]').find('li').should('have.length', 3);
		cy.get('button').should('have.attr', 'disabled');
		cy.get('input#radio-satisfaction-good').click({ force: true });
		cy.get('button').should('not.have.attr', 'disabled');
		cy.get('button').contains('Envoyer mon avis').click();
	});
	cy.wait(3000);

	cy.get('h1').contains('Clarté');
}

export function fillFormStep2() {
	cy.get('[class*="radioContainer"]')
		.find('fieldset')
		.find('li')
		.should('have.length', 5)
		.eq(4)
		.click();
	cy.get('button').contains('Continuer').click();
	cy.url().should('include', 'step=1');
	cy.get('h1').contains('Aides');
}

export function fillFormStep3() {
	cy.get('form').within(() => {
		cy.get('input[name="contact_tried-0"]').check({ force: true });
		cy.get('input[name="contact_tried-1"]').check({ force: true });
		cy.get('input[name="contact_tried-2"]').check({ force: true });
	});

	cy.get('[class*="SmileyInput-field"]')
		.eq(2)
		.within(() => {
			cy.get('fieldset')
				.eq(0)
				.find('input[type="radio"]')
				.eq(0)
				.check({ force: true });
			cy.get('fieldset')
				.eq(1)
				.find('input[type="radio"]')
				.eq(0)
				.check({ force: true });
			cy.get('fieldset')
				.eq(2)
				.find('input[type="radio"]')
				.eq(1)
				.check({ force: true });
		});
}

export function fillFormStep4() {
	cy.get("[class*='reviews']")
		.should('be.visible')
		.within(() => {
			cy.contains('label', 'Au guichet')
				.parents("[class*='optionRow']")
				.within(() => {
					cy.get('input[type="radio"]').eq(4).check({ force: true });
				});

			cy.contains('label', 'Par téléphone')
				.parents("[class*='optionRow']")
				.within(() => {
					cy.get('input[type="radio"]').eq(3).check({ force: true });
				});
		});

	cy.get('button').contains('Continuer').click();
	cy.get('h1').contains('Commentaire').should('exist');
	cy.get('form').within(() => {
		cy.get('textarea').type('e2e test content');
	});
	cy.get('button').contains('Terminer').click();
	cy.url().should('include', 'step=2');
	cy.get('h1').contains('Merci beaucoup !').should('exist');
}

export function getLastTestServiceID() {
	return cy
		.request({
			method: 'GET',
			url: `${appUrl}/api/cypress-test/getLastServiceId`,
			failOnStatusCode: false
		})
		.then(response => {
			if (response.status === 200) {
				return response.body;
			} else {
				throw new Error('ID not received');
			}
		});
}
