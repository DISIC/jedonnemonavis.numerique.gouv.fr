import { setSessionCookie } from '../../../utils/helpers/common';
import { selectors } from '../../../utils/selectors';
import { adminEmail, appUrl } from '../../../utils/variables';

const productsUrl = `${appUrl}${selectors.url.products}`;

describe('jdma-login', () => {
	it('should pass a11y checks', () => {
		cy.visit(`${appUrl}/login`);
		cy.injectAxe();
		cy.auditA11y();
	});

	it('only offers ProConnect, with the security notice and contact', () => {
		cy.visit(`${appUrl}/login`);
		cy.get(selectors.proconnectButton).should('be.visible');
		cy.contains('Une connexion plus sécurisée').should('be.visible');
		cy.contains('a', 'contact.jdma@design.numerique.gouv.fr').should(
			'have.attr',
			'href',
			'mailto:contact.jdma@design.numerique.gouv.fr'
		);
	});

	it('starts the ProConnect flow with the requested callback', () => {
		cy.intercept('POST', '/api/auth/signin/openid*', {
			statusCode: 200,
			body: { url: `${appUrl}/login?error=STUBBED` }
		}).as('signin');
		cy.visit(
			`${appUrl}/login?callbackUrl=${encodeURIComponent(
				selectors.url.entities
			)}`
		);
		cy.get(selectors.proconnectButton).click();
		cy.wait('@signin')
			.its('request.body')
			.should('include', encodeURIComponent(selectors.url.entities));
	});

	it('explains ProConnect rejections', () => {
		cy.visit(`${appUrl}/login?error=MFA_REQUIRED`);
		cy.contains('Double authentification requise').should('be.visible');
		cy.visit(`${appUrl}/login?error=LINK_CONFLICT`);
		cy.contains('Association impossible').should('be.visible');
		cy.visit(`${appUrl}/login?error=INVALID_PROVIDER`);
		cy.contains(
			'Nous ne sommes pas en mesure de valider votre accès avec ProConnect'
		).should('be.visible');
	});

	it('redirects the removed sign-up and password pages to the login', () => {
		['/register', '/register/validate', '/reset-password', '/login/otp'].forEach(
			path => {
				cy.visit(`${appUrl}${path}`);
				cy.url().should('eq', `${appUrl}/login`);
			}
		);
	});

	it('sends anonymous visitors of the back-office to the login', () => {
		cy.visit(productsUrl);
		cy.url().should('include', '/login?callbackUrl=');
	});

	it('rejects sessions without ProConnect MFA', () => {
		[null, 'eidas1'].forEach(acr => {
			cy.clearCookies();
			setSessionCookie(adminEmail, acr);
			cy.visit(productsUrl);
			cy.url().should('include', '/login');
		});
	});

	it('accepts a session with ProConnect MFA', () => {
		setSessionCookie(adminEmail, 'eidas2');
		cy.visit(productsUrl);
		cy.url().should('eq', productsUrl);
	});
});
