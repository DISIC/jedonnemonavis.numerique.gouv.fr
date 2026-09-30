import {
	fillFormStep1,
	fillFormStep2,
	fillFormStep3,
	fillFormStep4
} from '../../../utils/helpers/review';
import { appFormUrl } from '../../../utils/variables';

describe('jdma-form-review', () => {
	before(() => {
		cy.task<number>('db:getRootFormButtonId', 1).then(buttonId => {
			cy.visit(`${appFormUrl}/Demarches/1?button=${buttonId}`, {
				failOnStatusCode: false
			});
		});
		cy.get('h1').contains('Je donne mon avis').should('exist');
	});

	it('Fill form', () => {
		fillFormStep1();
		fillFormStep2();
		fillFormStep3();
		fillFormStep4();
	});
});
