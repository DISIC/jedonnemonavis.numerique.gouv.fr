import { PrismaClient } from '@prisma/client';
import { normalizeString } from '../../src/utils/tools';
import {
	DN_SERVICE_ACCOUNT_EMAIL,
	DN_SOURCE,
	DN_TAMPON_ENTITY_ACRONYM,
	DN_TAMPON_ENTITY_NAME
} from '../../src/utils/demarches-numeriques';

/**
 * Clé partenaire DN de développement (déterministe, pour les tests locaux/Cypress).
 * ⚠️ En production, la clé partenaire est créée par une route réservée aux superadmins,
 * jamais seedée. Voir docs/demarches-numeriques-provisioning.md.
 */
export const DEV_DN_PARTNER_API_KEY =
	'dev-dn-partner-key-000000000000000000000000';

/**
 * Seed du socle « Démarches Numériques » : organisation tampon, compte de service et
 * clé partenaire de dev. Idempotent (upsert / find avant create).
 */
export async function seed_demarches_numeriques(prisma: PrismaClient) {
	const tampon = await prisma.entity.upsert({
		where: { name: DN_TAMPON_ENTITY_NAME },
		update: { acronym: DN_TAMPON_ENTITY_ACRONYM },
		create: {
			name: DN_TAMPON_ENTITY_NAME,
			name_formatted: normalizeString(DN_TAMPON_ENTITY_NAME),
			acronym: DN_TAMPON_ENTITY_ACRONYM
		}
	});

	const serviceAccount = await prisma.user.upsert({
		where: { email: DN_SERVICE_ACCOUNT_EMAIL },
		update: {},
		create: {
			email: DN_SERVICE_ACCOUNT_EMAIL,
			firstName: 'Service',
			lastName: 'Démarches Numériques',
			active: true,
			role: 'user',
			// Compte de service : ne sert jamais à se connecter (pas de mot de passe utile).
			password: ''
		}
	});

	const existingKey = await prisma.apiKey.findFirst({
		where: { key: DEV_DN_PARTNER_API_KEY }
	});

	if (!existingKey) {
		await prisma.apiKey.create({
			data: {
				key: DEV_DN_PARTNER_API_KEY,
				scope: 'user',
				user_id: serviceAccount.id,
				is_partner: true,
				partner_source: DN_SOURCE
			}
		});
	}

	return { tampon, serviceAccount };
}
