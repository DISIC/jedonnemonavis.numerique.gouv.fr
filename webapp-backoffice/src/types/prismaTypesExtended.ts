import { Prisma } from '@prisma/client';

const AccessRightWithUsers = Prisma.validator<Prisma.AccessRightDefaultArgs>()({
	include: {
		user: true
	}
});

export type AccessRightWithUsers = Prisma.AccessRightGetPayload<
	typeof AccessRightWithUsers
>;

const ProductWithButtons = Prisma.validator<Prisma.ProductDefaultArgs>()({
	include: {
		buttons: true
	}
});

export type ProductWithButtons = Prisma.ProductGetPayload<
	typeof ProductWithButtons
>;
