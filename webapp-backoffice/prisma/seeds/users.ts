import { Prisma } from '@prisma/client';

export const users: Prisma.UserCreateInput[] = [
	{
		firstName: 'user',
		lastName: '1',
		active: false,
		xwiki_account: false,
		email: 'user1@example.com',
		password: '6fe77e050a06534bf96b58d48e2d9a591f1df6617c52caa880a7bd3e04be040f'
	},
	{
		firstName: 'user',
		lastName: '2',
		xwiki_account: true,
		active: false,
		email: 'user2@example.com',
		password: '6fe77e050a06534bf96b58d48e2d9a591f1df6617c52caa880a7bd3e04be040f'
	},
	{
		firstName: 'user',
		lastName: '3',
		xwiki_account: true,
		active: true,
		email: 'user3@example.com',
		password: '6fe77e050a06534bf96b58d48e2d9a591f1df6617c52caa880a7bd3e04be040f'
	},
	{
		firstName: 'user',
		lastName: '4',
		xwiki_account: false,
		active: true,
		email: 'user4@example.com',
		password: '6fe77e050a06534bf96b58d48e2d9a591f1df6617c52caa880a7bd3e04be040f'
	},
	{
		firstName: 'user',
		lastName: 'admin',
		role: 'admin',
		xwiki_account: false,
		active: true,
		email: 'admin@example.com',
		password: '6fe77e050a06534bf96b58d48e2d9a591f1df6617c52caa880a7bd3e04be040f'
	}
];
