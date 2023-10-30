import NextAuth, { DefaultSession } from 'next-auth';
import { Entity, UserRole } from '@prisma/client';
import { UserWithEntities } from './prismaTypesExtended';

declare module 'next-auth' {
	interface User extends UserWithEntities {
		id: number;
	}
	interface Session extends DefaultSession {
		user: {
			id: number;
			role: UserRole;
			entities: Entity[];
			// ...other properties
		} & DefaultSession['user'];
	}
}
