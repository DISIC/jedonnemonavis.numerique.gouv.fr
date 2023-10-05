import { Prisma } from '@prisma/client';

const UserProductUserWithUsers =
	Prisma.validator<Prisma.UserProductDefaultArgs>()({
		include: {
			user: true
		}
	});

export type UserProductUserWithUsers = Prisma.UserProductGetPayload<
	typeof UserProductUserWithUsers
>;
