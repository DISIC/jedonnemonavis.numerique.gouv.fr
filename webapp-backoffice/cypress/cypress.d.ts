declare namespace Cypress {
	interface Chainable {
		/**
		 * Run standardized axe-core accessibility checks
		 * with optional custom table display parameters.
		 *
		 * @param context  DOM selector or element to scope the test
		 * @param options  { withDetails?: boolean; detailId?: string }
		 */
		auditA11y(
			context?: string | Node,
			options?: {
				withDetails?: boolean;
				detailId?: string;
			}
		): Chainable<void>;
	}
}
