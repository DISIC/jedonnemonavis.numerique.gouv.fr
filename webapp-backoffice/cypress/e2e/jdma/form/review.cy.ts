import {
	fillFormStep1,
	fillFormStep2,
	fillFormStep3,
	fillFormStep4
} from '../../../utils/helpers/review';
import { displayViolationsTable } from '../../../utils/tools';
import { appFormUrl, appUrl } from '../../../utils/variables';

describe('jdma-form-review', () => {
	before(() => {
		cy.visit(`${appFormUrl}/Demarches/2?button=3`);

		cy.injectAxe();
		cy.checkA11y(
			null,
			{ includedImpacts: ['moderate', 'serious', 'critical'] },
			displayViolationsTable
		);
	});

	it('Fill form', () => {
		fillFormStep1();
		fillFormStep2();
		fillFormStep3();
		fillFormStep4();
	});
});
