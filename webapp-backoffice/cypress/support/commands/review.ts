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
	cy.visit(`${appFormUrl}/Demarches/1?button=1`);
	fillFormStep1();
	fillFormStep2();
	fillFormStep3();
	fillFormStep4();
});

export {};
