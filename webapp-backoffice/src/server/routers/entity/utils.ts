import { TRPCError } from '@trpc/server';
import { PrismaClient } from '@prisma/client';
import { Session } from 'next-auth';

/**
 * Vérifie que la session peut administrer l'organisation : admin global, ou
 * titulaire d'un AdminEntityRight sur cette organisation.
 */
export const checkEntityRight = async ({
	prisma,
	session,
	entity_id
}: {
	prisma: PrismaClient;
	session: Session;
	entity_id: number;
}) => {
	const entity = await prisma.entity.findUnique({
		where: { id: entity_id }
	});

	if (!entity)
		throw new TRPCError({ code: 'NOT_FOUND', message: 'Entity not found' });

	if (session.user.role.includes('admin')) return { entity };

	const adminEntityRight = await prisma.adminEntityRight.findFirst({
		where: { entity_id: entity.id, user_email: session.user.email }
	});

	if (!adminEntityRight)
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You do not have rights to proceed on this entity'
		});

	return { entity };
};
