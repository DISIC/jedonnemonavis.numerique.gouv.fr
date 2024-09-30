import { Prisma } from '@prisma/client';

const AccessRightWithUsers = Prisma.validator<Prisma.AccessRightDefaultArgs>()({
	include: {
		user: true
	}
});

export type AccessRightWithUsers = Prisma.AccessRightGetPayload<
	typeof AccessRightWithUsers
>;

const AdminEntityRightWithUsers =
	Prisma.validator<Prisma.AdminEntityRightDefaultArgs>()({
		include: {
			user: true
		}
	});

export type AdminEntityRightWithUsers = Prisma.AdminEntityRightGetPayload<
	typeof AdminEntityRightWithUsers
>;

const BlockWithOptions = Prisma.validator<Prisma.BlockDefaultArgs>()({
	include: {
		options: true
	}
});

export type BlockWithOptions = Prisma.BlockGetPayload<typeof BlockWithOptions>;

const ProductWithButtons = Prisma.validator<Prisma.ProductDefaultArgs>()({
	include: {
		buttons: true
	}
});

export type ProductWithButtons = Prisma.ProductGetPayload<
	typeof ProductWithButtons
>;

const UserWithEntities = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: {
		entities: true
	}
});

export type UserWithEntities = Prisma.UserGetPayload<typeof UserWithEntities>;

const UserRequestWithUser = Prisma.validator<Prisma.UserRequestDefaultArgs>()({
	include: {
		user: true
	}
});

export type UserRequestWithUser = Prisma.UserRequestGetPayload<
	typeof UserRequestWithUser
>;

const UserWithAccessRight = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: {
		accessRights: true
	}
});

export type UserWithAccessRight = Prisma.UserGetPayload<
	typeof UserWithAccessRight
>;
