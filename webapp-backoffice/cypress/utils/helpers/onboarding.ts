import { selectors } from '../selectors';

export const editStep = (stepSelector: string) => {
	cy.get(stepSelector).contains('button', 'Modifier').click();
};

export const skipStep = (stepSelector: string) => {
	cy.get(stepSelector)
		.contains('button', 'Passer cette étape')
		.click({ force: true });
};

export const addUserToProduct = (userEmail: string) => {
	cy.get(selectors.onboarding.step.access)
		.contains('a', 'Inviter des utilisateurs')
		.click();
	cy.get('input[class*="fr-input"]').type(userEmail);
	cy.get('input[value="carrier_admin"]').siblings('label').click();
	cy.get('button').contains('Continuer').click();
};
