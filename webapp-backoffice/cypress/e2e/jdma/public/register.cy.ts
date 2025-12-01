import { fillSignupForm } from '../../../utils/helpers/common';
import {
	checkExistingAccountError,
	checkSignupFormVisible,
	generateUniqueEmail,
	performPostRegistrationFlow,
	testEmailSubmission,
	testPasswordValidation,
	togglePasswordVisibility
} from '../../../utils/helpers/register';
import { selectors } from '../../../utils/selectors';
import { displayViolationsTable } from '../../../utils/tools';
import { appUrl, userPassword } from '../../../utils/variables';

const email = generateUniqueEmail();

describe('jdma-register', () => {
	beforeEach(() => {
		cy.visit(`${appUrl}/register`);
		cy.injectAxe();
	});

	it('should pass a11y checks', () => {
		cy.auditA11y();
	});

	// Vérification de la page initiale
	it('should display the agent public question first', () => {
		cy.contains('h2', 'Se créer un compte').should('be.visible');
		cy.contains(
			'legend',
			'Êtes-vous agent public ou rattaché à une administration ?'
		).should('be.visible');
		cy.get('input[value="no"]').should('exist').and('be.checked');
		cy.get('input[value="yes"]').should('exist').and('not.be.checked');
	});

	// Test du parcours non-agent
	it('should show message for non-agent public users', () => {
		cy.get('input[value="no"]').check({ force: true });
		cy.contains('button', 'Continuer').click();
		cy.contains('La création de compte est réservée aux agents public').should(
			'be.visible'
		);
	});

	// Test du parcours agent public
	describe('Agent public registration', () => {
		beforeEach(() => {
			cy.get('input[value="yes"]').check({ force: true });
			cy.contains('button', 'Continuer').click();
		});

		it('should display the signup form for agent public', () => {
			checkSignupFormVisible();
		});

		// Validation des contraintes de mot de passe
		describe('Password validation', () => {
			it('should not submit the form if the password is too short', () => {
				testPasswordValidation({
					password: 'Short1!',
					message: '12 caractères minimum'
				});
			});

			it('should not submit the form if the password lacks a special character', () => {
				testPasswordValidation({
					password: 'Password1234',
					message: '1 caractère spécial'
				});
			});

			it('should not submit the form if the password lacks a digit', () => {
				testPasswordValidation({
					password: 'Password!@#',
					message: '1 chiffre minimum'
				});
			});
		});

		// Cas d'e-mail non whitelisté
		it('should submit the form WITH NOT whitelisted email', () => {
			testEmailSubmission(
				'test123num@jdma.com',
				'Il y a déjà un compte avec cette adresse email.',
				'Demande de création de compte'
			);
		});

		// Visibilité du mot de passe
		it('should allow toggling password visibility', () => {
			togglePasswordVisibility('mypassword');
		});

		// Cas d'e-mail whitelisté
		it('should submit the form WITH whitelisted email', () => {
			fillSignupForm({ password: userPassword, email });

			cy.get(selectors.signupForm.submitButton).click();

			cy.url()
				.should('include', 'registered')
				.then(currentUrl => {
					if (currentUrl.includes('registered=classic')) {
						performPostRegistrationFlow(email);
					} else {
						checkExistingAccountError();
					}
				});
		});
	});
});
