import { login } from '../../../utils/helpers/common';
import { selectors } from '../../../utils/selectors';
import { adminEmail, adminPassword, appUrl } from '../../../utils/variables';

describe('jdma-review-delete', () => {
	before(() => {
		cy.submitCompleteReview();
		cy.submitCompleteReview();
	});

	beforeEach(() => {
		login(adminEmail, adminPassword);
		cy.visit(`${appUrl}${selectors.url.seededProductReviews}`);
		cy.contains('h2', 'Réponses').should('be.visible');
	});

	it('soft-deletes a review from the drawer', () => {
		cy.get('table tbody tr').then($rows => {
			const initialCount = $rows.length;

			cy.get('table tbody tr').first().click();

			cy.get(selectors.review.drawer)
				.contains('h1', selectors.review.drawerTitle)
				.should('be.visible');
			cy.get(selectors.review.drawer)
				.contains('button', selectors.review.deleteButton)
				.click();

			cy.get(selectors.modal.deleteReview)
				.should('be.visible')
				.within(() => {
					cy.contains('button', selectors.action.confirmDelete).click();
				});

			cy.contains(selectors.review.deleteToast).should('be.visible');
			cy.get('table tbody tr').should('have.length', initialCount - 1);
		});
	});

	it('lets a global admin view the deleted review via the filter, without a delete action', () => {
		cy.contains('button', selectors.review.moreFilters).click();
		cy.get(selectors.modal.filterReviews)
			.should('be.visible')
			.within(() => {
				cy.get(selectors.review.showDeletedToggle).check({ force: true });
				cy.contains('button', selectors.review.applyFilters).click();
			});

		cy.contains(selectors.review.deletedNotice).should('be.visible');
		cy.get('table tbody tr').should('have.length.at.least', 1);

		cy.get('table tbody tr').first().click();
		cy.get(selectors.review.drawer).within(() => {
			cy.contains(selectors.review.deletedBadge).should('be.visible');
			cy.contains('button', selectors.review.deleteButton).should('not.exist');
		});
	});
});
