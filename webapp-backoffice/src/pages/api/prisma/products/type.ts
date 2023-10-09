import { Prisma } from '@prisma/client';

const ProductWithButtons = Prisma.validator<Prisma.ProductDefaultArgs>()({
	include: {
		buttons: true
	}
});

export type ProductWithButtons = Prisma.ProductGetPayload<
	typeof ProductWithButtons
>;
