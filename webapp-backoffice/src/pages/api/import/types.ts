import { UserWithEntities } from '@/src/types/prismaTypesExtended';
import { AnswerIntention, AnswerKind, Button, Entity } from '@prisma/client';

export type ImportProduct = {
	xwiki_id: number;
	title: string;
	users: Omit<UserWithEntities, 'id'>[];
	buttons: Omit<Button, 'id'>[];
	entity: Omit<Entity, 'id'>;
};

export type ImportAnswer = {
	field_label: string;
	field_code: string;
	answer_item_id: number;
	answer_text: string;
	intention: AnswerIntention;
	kind: AnswerKind;
};

export type ImportReview = {
	form_id: number;
	xwiki_id: number;
	product_id: number;
	button_id: number;
	title: string;
	answers: ImportAnswer[];
	created_at: Date;
};
