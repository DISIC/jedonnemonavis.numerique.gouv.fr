import { selectors } from '../selectors';
import { appUrl } from '../variables';

// Helper function
const checkUrlRedirection = (selector: string, expectedUrl: string) => {
	cy.get(selector).click();
	cy.url().should('eq', appUrl + expectedUrl);
};

describe('jdma-home', () => {
	beforeEach(() => {
		cy.visit(appUrl);
	});

	// NAVBAR Tests
	describe('Navbar', () => {
		it('should display the correct navbar logo and title', () => {
			cy.get(selectors.header)
				.find(selectors.navbarLogo)
				.should('exist')
				.contains('RÉPUBLIQUE FRANÇAISE');
			cy.get(selectors.header)
				.should('contain', selectors.navbarTitle)
				.and('contain', selectors.navbarSubtitle);
		});

		it('should redirect to the home page when the logo is clicked', () => {
			checkUrlRedirection(`${selectors.header} .fr-header__brand`, '/');
		});

		it('should redirect to the login page', () => {
			checkUrlRedirection(
				`${selectors.loginLink} a:contains("Connexion / Inscription")`,
				'/login'
			);
		});
	});

	// BODY Tests
	describe('Body', () => {
		it('should display the correct title, subtitle and image', () => {
			cy.contains(
				selectors.bodyTitle,
				'Comment suivre la satisfaction de vos usagers ?'
			)
				.should('exist')
				.and('be.visible');
			cy.get(selectors.bodyTitle)
				.next(selectors.subtitle)
				.should($p => {
					const subtitle = $p.text();
					expect(subtitle).to.not.be.empty;
				});
			cy.get(selectors.image).should('exist').and('have.attr', 'src');
		});

		it('should have 4 steps and redirect correctly', () => {
			cy.get(selectors.stepsContainer).find('li').should('have.length', 4);
			checkUrlRedirection(
				`${selectors.stepsContainer} a:contains("Commencer")`,
				'/login'
			);
		});

		it('should redirect to user reviews page', () => {
			checkUrlRedirection(
				`${selectors.actionButton} h2:contains("Prêt à recueillir les avis des usagers ?") + a`,
				'/login'
			);
		});

		it('should toggle accordion content visibility', () => {
			cy.get(selectors.accordionGroup).each($accordion => {
				cy.wrap($accordion).find('.fr-collapse').should('not.be.visible');
				cy.wrap($accordion).find('.fr-accordion__btn').click();
				cy.wrap($accordion).find('.fr-collapse').should('be.visible');
				cy.wrap($accordion).find('.fr-accordion__btn').click();
				cy.wrap($accordion).find('.fr-collapse').should('not.be.visible');
			});
		});
	});

	// FOOTER Tests
	describe('Footer', () => {
		it('should display the correct footer logo', () => {
			cy.get(selectors.footer)
				.find(selectors.footerLogo)
				.should('exist')
				.contains('RÉPUBLIQUE FRANÇAISE');
		});

		it('should display and verify footer internal links', () => {
			// Vérifier la présence de chaque lien individuellement
			cy.get(selectors.footer)
				.find(selectors.footerLinks)
				.find('li')
				.should('have.length', 6);

			// Utiliser des expressions régulières pour être plus tolérant aux variations de formatage
			cy.get(selectors.footer)
				.contains(/Accessibilité\s*:\s*non conforme/i)
				.should('exist');
			cy.get(selectors.footer)
				.contains(/Mentions légales/i)
				.should('exist');
			cy.get(selectors.footer)
				.contains(/Données personnelles/i)
				.should('exist');

			// Vérifier le lien "Modalités d'utilisation" par son URL
			cy.get(selectors.footer)
				.find('a[href="/public/termsOfUse"]')
				.should('exist');

			cy.get(selectors.footer)
				.contains(/Roadmap/i)
				.should('exist');
			cy.get(selectors.footer)
				.contains(/Contact/i)
				.should('exist');
		});
	});
});
