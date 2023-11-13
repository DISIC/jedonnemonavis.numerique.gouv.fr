import {
	AnswerPartialWithRelations,
	ReviewPartialWithRelations
} from '@/prisma/generated/zod';

export interface ExtendedReview extends ReviewPartialWithRelations {
	satisfaction: AnswerPartialWithRelations | undefined;
	easy: AnswerPartialWithRelations | undefined;
	comprehension: AnswerPartialWithRelations | undefined;
	verbatim: AnswerPartialWithRelations | undefined;
}
