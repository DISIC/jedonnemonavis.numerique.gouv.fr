import { Prisma } from '@prisma/client';

const ProductWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
	include: {
		buttons: true,
		users: {
			include: {
				user: {
					select: {
						firstName: true,
						lastName: true
					}
				}
			}
		}
	}
});

export type ProductWithRelations = Prisma.ProductGetPayload<
	typeof ProductWithRelations
>;
