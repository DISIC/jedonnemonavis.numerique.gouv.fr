import { Button, Entity, User } from '@prisma/client';

export type ImportProduct = {
	observatoire_id: number;
	title: string;
	users: Omit<User, 'id'>[];
	buttons: Omit<Button, 'id'>[];
	entity: Omit<Entity, 'id'>;
};
