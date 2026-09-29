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
			proconnect: boolean;
		} & DefaultSession['user'];
		legacyLoginUntil: string | null;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		acr?: string;
		legacy?: boolean;
	}
}
