import 'cypress-axe';
import { displayViolationsTable } from '../utils/tools';
import * as axe from 'axe-core';

Cypress.Commands.add(
	'auditA11y',
	(
		context?: string | Node | axe.ContextObject,
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
