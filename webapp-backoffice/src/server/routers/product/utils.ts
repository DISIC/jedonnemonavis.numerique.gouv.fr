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
	if (typeof product_id !== 'number' && typeof form_id !== 'number') {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Either product_id or form_id must be provided'
		});
	}

	let resolvedProductId = product_id;

	if (typeof form_id === 'number') {
		const form = await prisma.form.findUnique({
			where: { id: form_id },
			select: { product_id: true }
		});

		if (!form) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Form not found'
			});
		}

		if (
			typeof resolvedProductId === 'number' &&
			form.product_id !== resolvedProductId
		) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'form_id does not belong to product_id'
			});
		}

		resolvedProductId = form.product_id;
	}

	const product = await prisma.product.findUnique({
		where: { id: resolvedProductId },
		include: { entity: { select: { name: true } } }
	});

	if (!product) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Product not found'
		});
	}

	const accessRight = await prisma.accessRight.findFirst({
		where: {
			product_id: product.id,
			user_email: session.user.email,
			status: authorizeCarrierUser
				? { in: ['carrier_admin', 'carrier_user'] }
				: 'carrier_admin'
		}
	});
	const adminEntityRight = await prisma.adminEntityRight.findFirst({
		where: {
			entity_id: product.entity_id,
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
