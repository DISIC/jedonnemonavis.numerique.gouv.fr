import type { Context } from '@/src/server/trpc';
import { TRPCError } from '@trpc/server';

const unauthorized = () =>
	new TRPCError({
		code: 'UNAUTHORIZED',
		message: 'Your are not authorized'
	});

/**
 * Vérifie que l'utilisateur courant a le droit d'agir sur les clés d'API du
 * périmètre demandé (un service ou une entité).
 *
 * Sans ce contrôle, n'importe quel compte authentifié peut se forger une clé
 * scopée sur le service ou l'entité d'autrui, et lire ses données via l'API
 * partenaire.
 *
 * Les droits acceptés suivent la même règle que `checkRightToProceed` :
 * porteur non révoqué du service, administrateur de l'entité qui le porte,
 * ou administrateur de la plateforme.
 */
export const assertApiKeyScopeAccess = async (
	ctx: Context,
	input: { product_id?: number; entity_id?: number }
) => {
	const ctx_user = ctx.session!.user;
	const ctx_user_email = ctx_user.email?.toLowerCase();

	if (!input.product_id && !input.entity_id) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'A product_id or entity_id is required'
		});
	}

	if (ctx_user.role.includes('admin')) {
		return;
	}

	if (!ctx_user_email) {
		throw unauthorized();
	}

	if (input.product_id) {
		const [accessRight, entityRightOnProduct] = await Promise.all([
			ctx.prisma.accessRight.findFirst({
				where: {
					user_email: ctx_user_email,
					product_id: input.product_id,
					status: { in: ['carrier_admin', 'carrier_user'] }
				}
			}),
			ctx.prisma.adminEntityRight.findFirst({
				where: {
					user_email: ctx_user_email,
					entity: { products: { some: { id: input.product_id } } }
				}
			})
		]);

		if (!accessRight && !entityRightOnProduct) {
			throw unauthorized();
		}
	}

	if (input.entity_id) {
		const adminEntityRight = await ctx.prisma.adminEntityRight.findFirst({
			where: {
				user_email: ctx_user_email,
				entity_id: input.entity_id
			}
		});

		if (!adminEntityRight) {
			throw unauthorized();
		}
	}
};
