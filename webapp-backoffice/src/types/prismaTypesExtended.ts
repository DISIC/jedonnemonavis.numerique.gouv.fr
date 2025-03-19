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

const ProductWithForms = Prisma.validator<Prisma.ProductDefaultArgs>()({
	include: {
		forms: {
			include: {
				buttons: true
			}
		}
	}
});

export type ProductWithForms = Prisma.ProductGetPayload<
	typeof ProductWithForms
>;

const ButtonWithForm = Prisma.validator<Prisma.ButtonDefaultArgs>()({
	include: {
		form: true
	}
});

export type ButtonWithForm = Prisma.ButtonGetPayload<typeof ButtonWithForm>;

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
