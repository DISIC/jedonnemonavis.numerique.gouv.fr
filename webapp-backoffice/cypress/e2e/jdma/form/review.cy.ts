import {
	fillFormStep1,
	fillFormStep2,
	fillFormStep3,
	fillFormStep4
} from '../../../utils/helpers/review';
import { appFormUrl, appUrl } from '../../../utils/variables';

describe('jdma-form-review', () => {
	before(() => {
		cy.visit(`${appFormUrl}/Demarches/2?button=3`);
		cy.reload();
	});

	it('Fill form', () => {
		fillFormStep1();
		fillFormStep2();
		fillFormStep3();
		fillFormStep4();
	});
});
