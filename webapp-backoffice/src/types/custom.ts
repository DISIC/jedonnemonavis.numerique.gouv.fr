import { AnswerIntention } from '@prisma/client';
import { Answer, Prisma } from "@prisma/client";

export type FieldCodeBoolean = 'difficulties' | 'help' | 'contact_reached';
export type FieldCodeSmiley =
	| 'satisfaction'
	| 'easy'
	| 'comprehension'
	| 'contact_satisfaction';
export type FieldCodeDetails =
	| 'difficulties_details'
	| 'contact'
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

export type Buckets = [
	{ key: string; key_as_string: string; doc_count: number },
  ];
  
  export type BucketsInside = [
	{
	  key: string;
	  key_as_string: string;
	  doc_count: number;
	  term: {
		buckets: Buckets;
	  };
	},
  ];


export interface ElkAnswer extends Prisma.AnswerUncheckedCreateInput {
	product_name: string;
	product_id: number;
	button_name: string;
	button_id: number;
	created_at: Date;
  }
