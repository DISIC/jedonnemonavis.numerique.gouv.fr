import {
	AnswerIntentionSchema,
	AnswerKindSchema
} from '@/prisma/generated/zod';
import { z } from 'zod';

export const MAX_ANSWER_TEXT_LENGTH = 15000;
export const MAX_ANSWERS = 200;

export const reviewInputSchema = z.object({
	product_id: z.number().int(),
	button_id: z.number().int(),
	form_id: z.number().int(),
	user_id: z.string().uuid()
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

const answerScalarsSchema = z.object({
	field_code: z.string().max(255),
	field_label: z.string().max(2000),
	answer_item_id: z.number().int(),
	answer_text: z.string().max(MAX_ANSWER_TEXT_LENGTH),
	intention: AnswerIntentionSchema.nullable().optional(),
	kind: AnswerKindSchema
});

export type ReviewChildAnswerInput = z.infer<typeof answerScalarsSchema>;

export const reviewAnswerInputSchema = answerScalarsSchema.extend({
	child_answers: z
		.object({
			createMany: z.object({
				data: z.array(answerScalarsSchema).max(MAX_ANSWERS)
			})
		})
		.optional()
});

export type ReviewAnswerInput = z.infer<typeof reviewAnswerInputSchema>;

export const reviewAnswersInputSchema = z
	.array(reviewAnswerInputSchema)
	.max(MAX_ANSWERS);

export const dynamicAnswerInputSchema = z.object({
	block_id: z.number().int(),
	answer_item_id: z.number().int().optional(),
	answer_text: z.string().max(MAX_ANSWER_TEXT_LENGTH).optional()
});

export type DynamicAnswerInput = z.infer<typeof dynamicAnswerInputSchema>;

export const dynamicAnswersInputSchema = z
	.array(dynamicAnswerInputSchema)
	.max(MAX_ANSWERS);
