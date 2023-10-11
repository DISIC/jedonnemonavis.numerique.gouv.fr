import NextAuth, { DefaultSession } from 'next-auth';
import { User as UserModel, UserRole } from '@prisma/client';

declare module 'next-auth' {
	interface User extends UserModel {
		id: number;
	}
	interface Session extends DefaultSession {
		user: {
			id: string;
			role: UserRole;
			// ...other properties
		} & DefaultSession['user'];
	}
}
