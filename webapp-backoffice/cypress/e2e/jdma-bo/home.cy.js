const app_url = 'https://jedonnemonavis.numerique.gouv.fr/';
describe('jdma-home', () => {
	beforeEach(() => {
		cy.visit(app_url);
	});
	// NAVBAR
	it('check navbar logo', () => {
		cy.get('header')
			.find('.fr-logo')
			.should('exist')
			.contains('RÉPUBLIQUE FRANÇAISE');
	});
	it('check navbar title', () => {
		cy.get('header')
			.should('contain', 'Je donne mon avis')
			.and('contain', 'La voix de vos usagers');
	});
	it('check navbar logo url redirection', () => {
		cy.get('header').find('.fr-header__brand').click();
		cy.url().should('eq', app_url);
	});
	it('check navbar login url redirection', () => {
		cy.get('header')
			.find('.fr-header__tools')
			.contains('Connexion / Inscription')
			.click();
		cy.url().should('eq', app_url + 'login');
	});

	// BODY
	it('check title <h1>, subtitle <p> and img', () => {
		cy.contains('h1', 'Comment suivre la satisfaction de vos usagers ?')
			.should('exist')
			.and('be.visible')
			.next('p')
			.should($p => {
				const subtitle = $p.text();
				expect(subtitle).to.not.be.empty;
			});
		cy.get('[class*="HomeHeader-image"] > img')
			.should('exist')
			.should('have.attr', 'src');
	});

	it('check steps list length === 4 and url redirection', () => {
		cy.get('[class*="HomeStepper-container"')
			.find('li')
			.should('have.length', 4);
		cy.get('[class*="HomeStepper-container"')
			.find('a')
			.should('contain', 'Commencer')
			.click();
		cy.url().should('eq', app_url + 'login');
	});

	it('check url redirection for users reviews', () => {
		cy.get('[class*="HomeActionButton-container"')
			.find('h2')
			.contains('Prêt à recueillir les avis des usagers ?')
			.next('a')
			.click();
		cy.url().should('eq', app_url + 'login');
	});

	it('check url redirection for contact', () => {
		cy.get('[class*="HomeActionButton-container"')
			.find('h2')
			.contains("Vous avez d'autres questions ? Des doutes ? Contactez-nous !")
			.next('a')
			.click();
		cy.url().should('eq', app_url + 'public/contact');
	});

	it('should toggle visibility of accordion content', () => {
		cy.get('.fr-accordions-group .fr-accordion__item').each($accordion => {
			cy.wrap($accordion).find('.fr-collapse').should('not.be.visible');
			cy.wrap($accordion).find('.fr-accordion__btn').click();
			cy.wrap($accordion).find('.fr-collapse').should('be.visible');
			cy.wrap($accordion).find('.fr-accordion__btn').click();
			cy.wrap($accordion).find('.fr-collapse').should('not.be.visible');
		});
	});

	// FOOTER
	it('check footer logo', () => {
		cy.get('footer')
			.find('.fr-logo')
			.should('exist')
			.contains('RÉPUBLIQUE FRANÇAISE');
	});

	it('check footer internal links', () => {
		cy.get('footer')
			.find('.fr-footer__bottom-list')
			.should('exist')
			.find('li')
			.each($el => {
				cy.wrap($el)
					.invoke('text')
					.then(text => {
						if (text.startsWith('Accessibilité')) {
							expect(text.trim()).to.include('Accessibilité');
						} else {
							const texts = [
								'Accessibilité: non conforme',
								'Mentions légales',
								'Données personnelles',
								'Modalités d’utilisation',
								'Contact'
							];
							expect(text).to.be.oneOf(texts);
						}
					});
			});
	});
});
