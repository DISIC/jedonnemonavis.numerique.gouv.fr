import { UserWithEntities } from '@/src/types/prismaTypesExtended';
import { Button, Entity } from '@prisma/client';

export type ImportProduct = {
	xwiki_id: number;
	title: string;
	users: Omit<UserWithEntities, 'id'>[];
	buttons: Omit<Button, 'id'>[];
	entity: Omit<Entity, 'id'>;
};

export type ImportAdminEntityRight = {
	user_email: string;
	entity_name: string;
};
