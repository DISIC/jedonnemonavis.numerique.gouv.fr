import 'cypress-axe';
import { displayViolationsTable } from '../utils/tools';
import axe = require('axe-core');

Cypress.Commands.add(
	'auditA11y',
	(
		context: string | Node | axe.ContextObject | null = null,
		options?: {
			withDetails?: boolean;
			detailId?: string;
		}
	) => {
		const { withDetails = false, detailId } = options || {};

		cy.checkA11y(
			context,
			{ includedImpacts: ['moderate', 'serious', 'critical'] },
			violations => displayViolationsTable(violations, withDetails, detailId)
		);
	}
);
