import {
	fillFormStep1,
	fillFormStep2,
	fillFormStep3,
	fillFormStep4
} from '../../../utils/helpers/review';
import { appFormUrl } from '../../../utils/variables';

describe('jdma-form-review', () => {
	before(() => {
		// Use deterministic seed URL: Product 1, Button 1 (root form template)
		cy.visit(`${appFormUrl}/Demarches/1?button=1`, {
			failOnStatusCode: false
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
