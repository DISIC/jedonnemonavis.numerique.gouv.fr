import { login } from '../../../utils/helpers/common';
import { selectors } from '../../../utils/selectors';
import { adminEmail, adminPassword, appUrl } from '../../../utils/variables';

// Seed flags the root form of "Impots.gouv.fr" as a démarche essentielle
// (isDemarcheEssentielle in prisma/seeds/products.ts -> Form.isTop250 = true).
const DE_PRODUCT = 'Impots.gouv.fr';

describe('jdma-demarche-essentielle', () => {
	beforeEach(() => {
		login(adminEmail, adminPassword);
	});

	const goToDemarcheEssentielleForms = () => {
		cy.visit(`${appUrl}${selectors.url.products}`);
		cy.get('input[placeholder="Rechercher un service"]')
			.should('be.visible')
			.clear()
			.type(DE_PRODUCT);
		cy.contains('button', 'Rechercher').click();
		cy.get(`a[title="${DE_PRODUCT}"]`)
			.first()
			.should('be.visible')
			.click({ force: true });
	};

	it('shows the démarche essentielle badge on the forms list', () => {
		goToDemarcheEssentielleForms();
		cy.contains('Démarche essentielle').should('be.visible');
	});

	it('locks the root form against edition and deletion', () => {
		goToDemarcheEssentielleForms();

		// Open the (single) locked root form
		cy.get('a[href*="/forms/"]')
			.filter((_i, el) => /\/forms\/\d+$/.test(el.getAttribute('href') || ''))
			.first()
			.then($link => {
				const formUrl = $link.prop('href') as string;
				cy.visit(formUrl);

				// Locked notice is shown on the form page
				cy.contains('Ce formulaire ne peut être ni édité ni supprimé').should(
					'be.visible'
				);
				cy.contains('Démarche essentielle').should('be.visible');

				// The edit route is blocked server-side and redirects back to the form
				cy.visit(`${formUrl}/edit`);
				cy.location('pathname').should('not.match', /\/edit$/);
				cy.contains('Ce formulaire ne peut être ni édité ni supprimé').should(
					'be.visible'
				);
			});
	});

	it('hides the delete-service section when the product has a locked form', () => {
		goToDemarcheEssentielleForms();
		cy.location('pathname').then(formsPath => {
			const infosPath = formsPath.replace(/\/forms$/, '/infos');
			cy.visit(`${appUrl}${infosPath}`);
			cy.contains('Supprimer le service').should('not.exist');
		});
	});
});
