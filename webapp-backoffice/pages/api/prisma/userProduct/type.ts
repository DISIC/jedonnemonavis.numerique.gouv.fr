import { Prisma } from '@prisma/client';

const UserProductUserWithUsers =
	Prisma.validator<Prisma.UserProductDefaultArgs>()({
		include: {
			user: {
				select: {
					firstName: true,
					lastName: true
				}
			}
		}
	});

export type UserProductUserWithUsers = Prisma.UserProductGetPayload<
	typeof UserProductUserWithUsers
>;
