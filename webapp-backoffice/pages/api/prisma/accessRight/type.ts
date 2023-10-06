import { Prisma } from '@prisma/client';

const AccessRightUserWithUsers =
	Prisma.validator<Prisma.AccessRightDefaultArgs>()({
		include: {
			user: true
		}
	});

export type AccessRightUserWithUsers = Prisma.AccessRightGetPayload<
	typeof AccessRightUserWithUsers
>;
