import { login } from '../../../utils/helpers/common';
import { displayViolationsTable } from '../../../utils/tools';
import { adminEmail, adminPassword } from '../../../utils/variables';

describe('jdma-answer-check', () => {
	beforeEach(() => {
		login(adminEmail, adminPassword);
		cy.injectAxe();
		// cy.checkA11y(
		// 	null,
		// 	{ includedImpacts: ['moderate', 'serious', 'critical'] },
		// 	displayViolationsTable
		// );
	});

	it('should the test answer exist', () => {
		cy.get('span.fr-text--bold')
			.invoke('text')
			.then(text => {
				const value = parseInt(text);
				expect(value).to.not.equal(0);
			});
	});

	// TODO : change to test on product side
	// it('should activate the stats public page', () => {
	// 	cy.get('a[href*="/administration/dashboard/product/2/forms/2"]')
	// 		.click()
	// 		.then(() => {
	// 			cy.get('button').contains('Statistiques').click();
	// 			cy.get('button')
	// 				.contains('Rendre ces statistiques publiques')
	// 				.first()
	// 				.click()
	// 				.then(() => {
	// 					cy.get('.fr-toggle__label')
	// 						.first()
	// 						.click()
	// 						.then(() => {
	// 							cy.get('a[href="/public/product/2/stats"]').then($link => {
	// 								const url = $link.prop('href');
	// 								expect(url).to.contain('/public/product/2/stats');
	// 								cy.get('a[href="/public/product/2/stats"]')
	// 									.click()
	// 									.then(() => {
	// 										cy.get('h1').contains('e2e-jdma-service-test-1');
	// 									});
	// 							});
	// 						});
	// 				});
	// 		});
	// });

	// it('should deactivate the stats public page', () => {
	// 	cy.get('a[href*="/administration/dashboard/product/2/forms/2"]')
	// 		.click()
	// 		.then(() => {
	// 			cy.get('button').contains('Statistiques').click();
	// 			cy.get('button')
	// 				.contains('Rendre ces statistiques publiques')
	// 				.first()
	// 				.click()
	// 				.then(() => {
	// 					cy.get('.fr-toggle__label')
	// 						.first()
	// 						.click()
	// 						.then(() => {
	// 							cy.get('a[href="/public/product/2/stats"]').should('not.exist');
	// 						});
	// 				});
	// 		});
	// });
});
