import { TRPCError } from '@trpc/server';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Session } from 'next-auth';

export const checkRightToProceed = async ({
	prisma,
	session,
	product_id,
	form_id,
	authorizeCarrierUser = false
}: {
	prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
	session: Session;
	product_id?: number;
	form_id?: number;
	authorizeCarrierUser?: boolean;
}) => {
	const orFilters: Prisma.ProductWhereInput[] = [];
	if (typeof product_id === 'number') {
		orFilters.push({ id: product_id });
	}
	if (typeof form_id === 'number') {
		orFilters.push({ forms: { some: { id: form_id } } });
	}

	if (orFilters.length === 0) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Either product_id or form_id must be provided'
		});
	}

	const product = await prisma.product.findFirst({
		where: {
			OR: orFilters
		},
		include: { entity: { select: { name: true } } }
	});

	const accessRight = await prisma.accessRight.findFirst({
		where: {
			product_id: product_id,
			user_email: session.user.email,
			status: authorizeCarrierUser
				? { in: ['carrier_admin', 'carrier_user'] }
				: 'carrier_admin'
		}
	});
	const adminEntityRight = await prisma.adminEntityRight.findFirst({
		where: {
			entity_id: product?.entity_id,
			user_email: session.user.email
		}
	});
	const isAdmin = session.user.role.includes('admin');

	if (!accessRight && !adminEntityRight && !isAdmin)
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You do not have rights to proceed on this product'
		});

	return { hasRight: !!accessRight || isAdmin, product };
};
