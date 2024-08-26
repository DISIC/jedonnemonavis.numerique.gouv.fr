const app_url = Cypress.env('app_form_base_url');
const app_bo_url = Cypress.env('app_base_url');

describe('jdma-form-review', () => {
	before(() => {
		getLastTestServiceID().then(formInfo => {
			cy.log('formInfo', formInfo);
			cy.visit(
				app_url +
					'/Demarches/' +
					formInfo.productId +
					'?button=' +
					formInfo.lastTestButtonId
			);
		});
	});

	it('Fill form', () => {
		cy.get('[class*="formSection"]').within(() => {
			cy.get('h1').contains('Je donne mon avis');
			cy.get('[class*="smileysContainer"]').find('li').should('have.length', 3);
			cy.get('button').should('have.attr', 'disabled');
			cy.get('input#radio-satisfaction-good').click({ force: true });
			cy.get('button').should('not.have.attr', 'disabled');
			cy.get('button').contains('Envoyer mon avis').click();
			cy.wait(5000);
			cy.url().should('include', 'step=0');
			cy.get('h1').contains('Clarté');
			cy.get('[class*="radioContainer"]')
				.find('fieldset')
				.find('li')
				.should('have.length', 5)
				.eq(4)
				.click();
			cy.get('button').contains('Continuer').click();
			cy.wait(5000);
			cy.url().should('include', 'step=1');
			cy.get('h1').contains('Aides');

			cy.get('form').within(() => {
				cy.get('input[name="contact_tried-0"]').check({ force: true });
				cy.get('input[name="contact_tried-1"]').check({ force: true });
				cy.get('input[name="contact_tried-2"]').check({ force: true });
			});
			cy.wait(4000);

			cy.get('[class*="SmileyInput-field"]')
				.eq(2)
				.within(() => {
					cy.get('fieldset')
						.eq(0)
						.find('input[type="radio"]')
						.eq(0)
						.check({ force: true }); // Oui pour "Au guichet avec l’administration"
					cy.get('fieldset')
						.eq(1)
						.find('input[type="radio"]')
						.eq(0)
						.check({ force: true }); // Oui pour "Par téléphone avec l’administration"
					cy.get('fieldset')
						.eq(2)
						.find('input[type="radio"]')
						.eq(1)
						.check({ force: true }); // Non pour "Par e-mail avec l’administration"
				});
			cy.wait(2000);
		});
		cy.get("[class*='mainTable']").should('exist').should('be.visible');
		cy.get("[class*='mainTable']").within(() => {
			// Ciblez la ligne qui contient "Au guichet"
			cy.contains('label', 'Au guichet')
				.parents('tr')
				.within(() => {
					cy.get('input[type="radio"]').eq(4).check({ force: true }); // Sélectionnez "Excellente"
				});

			// Ciblez la ligne qui contient "Par téléphone"
			cy.contains('label', 'Par téléphone')
				.parents('tr')
				.within(() => {
					cy.get('input[type="radio"]').eq(3).check({ force: true }); // Sélectionnez "Bonne"
				});
		});
		cy.get('button').contains('Continuer').click();
		cy.wait(4000);
		cy.get('h1').contains('Informations complémentaires').should('exist');
		cy.get('form').within(() => {
			cy.get('textarea').type('e2e test content');
		});
		cy.get('button').contains('Terminer').click();
		cy.wait(4000);
		cy.url().should('include', 'step=2');
		cy.get('h1').contains('Merci beaucoup !').should('exist');

		// DELETE ALL TESTS IN BDD
		deleteTestUsers();
	});
});

function deleteTestUsers() {
	cy.request({
		method: 'DELETE',
		url: app_bo_url + '/api/cypress-test/deleteUsersAndProduct'
	}).then(response => {
		cy.log(response.body.message);
	});
}

function getLastTestServiceID() {
	return cy
		.request({
			method: 'GET',
			url: app_bo_url + '/api/cypress-test/getLastServiceId',
			failOnStatusCode: false
		})
		.then(response => {
			if (response.status === 200) {
				const res = response.body;
				return res;
			} else {
				throw new Error('ID not received');
			}
		});
}
