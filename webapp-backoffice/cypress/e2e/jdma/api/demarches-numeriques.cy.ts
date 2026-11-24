/**
 * Tests d'API du parcours de provisioning Démarches Numériques (DN).
 * Endpoints OpenAPI server-to-server, authentifiés par la clé partenaire seedée.
 * Voir docs/demarches-numeriques-provisioning.md.
 */

const API = '/api/open-api/demarches-numeriques';
// Clé partenaire DN de dev, créée par le seed (prisma/seeds/demarches-numeriques.ts).
const PARTNER_KEY = 'dev-dn-partner-key-000000000000000000000000';

// external_id unique par exécution (les retries d'un même run le réutilisent : les
// assertions ne dépendent donc pas de `already_existed` au premier appel).
const EXTERNAL_ID = `cypress-dn-${Date.now()}`;
const CREATOR = `cypress-dn-creator-${Date.now()}@example.com`;
const ADMIN = `cypress-dn-admin-${Date.now()}@example.com`;
const NEW_ADMIN = `cypress-dn-newadmin-${Date.now()}@example.com`;

const partnerHeaders = { Authorization: `Bearer ${PARTNER_KEY}` };

describe('jdma-api-demarches-numeriques', () => {
	let productId: number;

	it('provisionne un service (création)', () => {
		cy.request({
			method: 'POST',
			url: `${API}/services`,
			headers: partnerHeaders,
			body: {
				external_id: EXTERNAL_ID,
				demarche_name: 'Démarche Cypress DN',
				organisation_name: 'Organisation Cypress DN',
				creator_email: CREATOR,
				admin_emails: [ADMIN],
				integration_type: 'button'
			}
		}).then(res => {
			expect(res.status).to.eq(200);
			expect(res.body).to.have.property('product_id');
			expect(res.body).to.have.property('form_id');
			expect(res.body).to.have.property('button_id');
			expect(res.body.integration_url).to.include(`?button=`);
			expect(res.body.integration_code).to.include('<a href=');
			expect(res.body.invitations).to.have.length(2);
			productId = res.body.product_id;
		});
	});

	it('est idempotent sur external_id', () => {
		cy.request({
			method: 'POST',
			url: `${API}/services`,
			headers: partnerHeaders,
			body: {
				external_id: EXTERNAL_ID,
				demarche_name: 'Démarche Cypress DN',
				organisation_name: 'Organisation Cypress DN',
				creator_email: CREATOR,
				admin_emails: [ADMIN],
				integration_type: 'button'
			}
		}).then(res => {
			expect(res.status).to.eq(200);
			expect(res.body.already_existed).to.eq(true);
			expect(res.body.product_id).to.eq(productId);
		});
	});

	it('ajoute des admins (already_admin + invited)', () => {
		cy.request({
			method: 'POST',
			url: `${API}/services/${EXTERNAL_ID}/admins`,
			headers: partnerHeaders,
			body: { admin_emails: [CREATOR, NEW_ADMIN] }
		}).then(res => {
			expect(res.status).to.eq(200);
			const byEmail: Record<string, string> = {};
			res.body.results.forEach((r: { email: string; status: string }) => {
				byEmail[r.email] = r.status;
			});
			expect(byEmail[CREATOR.toLowerCase()]).to.eq('already_admin');
			expect(byEmail[NEW_ADMIN.toLowerCase()]).to.eq('invited');
		});
	});

	it('renvoie 404 pour un external_id inconnu', () => {
		cy.request({
			method: 'POST',
			url: `${API}/services/external-id-inexistant-cypress/admins`,
			headers: partnerHeaders,
			body: { admin_emails: [NEW_ADMIN] },
			failOnStatusCode: false
		}).then(res => {
			expect(res.status).to.eq(404);
		});
	});

	it('refuse sans clé API (401)', () => {
		cy.request({
			method: 'POST',
			url: `${API}/services`,
			body: {
				external_id: `${EXTERNAL_ID}-noauth`,
				demarche_name: 'x',
				organisation_name: 'x',
				creator_email: 'x@example.com'
			},
			failOnStatusCode: false
		}).then(res => {
			expect(res.status).to.eq(401);
		});
	});
});
