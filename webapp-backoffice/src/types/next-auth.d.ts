import NextAuth, { DefaultSession } from 'next-auth';
import { User as UserModel } from '@prisma/client';

declare module 'next-auth' {
	interface User extends UserModel {
		id: number;
	}
	interface Session extends DefaultSession {
		user: {
			id: string;
			// ...other properties
			// role: UserRole;
		} & DefaultSession['user'];
	}
}
