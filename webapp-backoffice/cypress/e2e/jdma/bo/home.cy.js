const app_url = Cypress.env('app_base_url');

const selectors = {
	header: 'header',
	navbarLogo: '.fr-logo',
	navbarTitle: 'Je donne mon avis',
	navbarSubtitle: 'La voix de vos usagers',
	loginLink: '.fr-header__tools',
	bodyTitle: 'h1',
	subtitle: 'p',
	image: '[class*="HomeHeader-image"] > img',
	stepsContainer: '[class*="HomeStepper-container"]',
	actionButton: '[class*="HomeActionButton-container"]',
	accordionGroup: '.fr-accordions-group .fr-accordion__item',
	footer: 'footer',
	footerLinks: '.fr-footer__bottom-list',
	footerLogo: '.fr-logo'
};

// Helper function
const checkUrlRedirection = (selector, expectedUrl) => {
	cy.get(selector).click();
	cy.url().should('eq', app_url + expectedUrl);
};

describe('jdma-home', () => {
	beforeEach(() => {
		cy.visit(app_url);
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
			const expectedTexts = [
				'Accessibilité: non conforme',
				'Mentions légales',
				'Données personnelles',
				'Modalités d’utilisation',
				'Contact'
			];

			cy.get(selectors.footer)
				.find(selectors.footerLinks)
				.find('li')
				.each($el => {
					cy.wrap($el)
						.invoke('text')
						.then(text => {
							expect(expectedTexts).to.include(text.trim());
						});
				});
		});
	});
});
