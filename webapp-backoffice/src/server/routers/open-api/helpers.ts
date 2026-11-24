import { TRPCError } from '@trpc/server';
import { ApiKey, ProductSource } from '@prisma/client';
import type { Context } from '@/src/server/trpc';

/**
 * Garde des endpoints partenaire (server-to-server).
 *
 * `protectedApiProcedure` valide déjà le Bearer et peuple `ctx.api_key`. Ici on exige en
 * plus que la clé soit une clé partenaire (`is_partner`), et — si `source` est fourni —
 * qu'elle soit autorisée pour cette source (`partner_source`).
 *
 * On n'autorise volontairement PAS un partenaire via le rôle `admin`/`superadmin` du
 * compte porteur : ce serait un privilège bien trop large. Voir
 * docs/demarches-numeriques-provisioning.md.
 */
export function assertPartnerKey(ctx: Context, source?: ProductSource): ApiKey {
	const key = ctx.api_key;

	if (!key || !key.is_partner) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'This endpoint requires a partner API key'
		});
	}

	if (source && key.partner_source !== source) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: `This partner key is not authorized for source "${source}"`
		});
	}

	return key;
}
