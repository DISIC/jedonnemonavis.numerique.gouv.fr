import {
	fillFormStep1,
	fillFormStep2,
	fillFormStep3,
	fillFormStep4
} from '../../utils/helpers/review';
import { appFormUrl } from '../../utils/variables';

declare global {
	namespace Cypress {
		interface Chainable<Subject> {
			submitCompleteReview(): Chainable<void>;
		}
	}
}

Cypress.Commands.add('submitCompleteReview', () => {
	// Use deterministic seed URL: Product 1, Button 1 (root form template)
	cy.visit(`${appFormUrl}/Demarches/1?button=1`);
	fillFormStep1();
	fillFormStep2();
	fillFormStep3();
	fillFormStep4();
});

export {};
