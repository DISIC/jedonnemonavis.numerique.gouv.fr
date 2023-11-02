import { AnswerIntention } from '@prisma/client';

export type FieldCodeBoolean = 'difficulties' | 'help' | 'contact';
export type FieldCodeSmiley =
	| 'satisfaction'
	| 'easy'
	| 'comprehension'
	| 'contact_satisfaction';
export type FieldCodeDetails =
	| 'difficulties_details'
	| 'contact_reached'
	| 'contact_channels'
	| 'help_details';

export type FieldCode = FieldCodeBoolean | FieldCodeSmiley | FieldCodeDetails;

export type ElkSimpleAnswerResponse = {
	data: [
		{
			answer_text: string;
			intention: AnswerIntention;
			doc_count: number;
		}
	];
	metadata: { total: number; average: number; fieldLabel: string };
};
