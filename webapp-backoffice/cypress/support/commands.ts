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

		// Exclude known DSFR elements that have upstream a11y issues
		// (aria-labelledby on .fr-header__menu div with no valid role)
		const dsfrExclusions = ['.fr-header__menu'];

		let resolvedContext: axe.ContextObject;
		if (context == null) {
			resolvedContext = { exclude: dsfrExclusions };
		} else if (typeof context === 'string') {
			resolvedContext = { include: [context], exclude: dsfrExclusions };
		} else if (
			typeof context === 'object' &&
			('include' in context || 'exclude' in context)
		) {
			const existing = (context as axe.ContextObject).exclude || [];
			const existingArr = Array.isArray(existing) ? existing : [existing];
			resolvedContext = {
				...context,
				exclude: [...existingArr, ...dsfrExclusions]
			} as axe.ContextObject;
		} else {
			resolvedContext = { exclude: dsfrExclusions };
		}

		cy.checkA11y(
			resolvedContext,
			{ includedImpacts: ['moderate', 'serious', 'critical'] },
			violations => displayViolationsTable(violations, withDetails, detailId)
		);
	}
);
