import { appUrl } from '../../../utils/variables';

describe('jdma-login', () => {
	beforeEach(() => {
		cy.visit(`${appUrl}/login`);
		cy.injectAxe();
	});

	it('should pass a11y checks', () => {
		cy.auditA11y();
	});
});
