import { AnswerIntention } from '@prisma/client';
import { Answer, Prisma } from '@prisma/client';
import {
	FIELD_CODE_BOOLEAN_VALUES,
	FIELD_CODE_DETAILS_VALUES,
	FIELD_CODE_SMILEY_VALUES
} from '../utils/helpers';

export type FieldCodeBoolean =
	(typeof FIELD_CODE_BOOLEAN_VALUES)[number]['slug'];
export type FieldCodeSmiley = (typeof FIELD_CODE_SMILEY_VALUES)[number]['slug'];
export type FieldCodeDetails =
	(typeof FIELD_CODE_DETAILS_VALUES)[number]['slug'];

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
	{ key: string; key_as_string: string; doc_count: number }
];

export type BucketsInside = [
	{
		key: string;
		key_as_string: string;
		doc_count: number;
		term: {
			buckets: Buckets;
		};
	}
];

export interface ElkAnswer extends Prisma.AnswerUncheckedCreateInput {
	product_name: string;
	product_id: number;
	button_name: string;
	button_id: number;
	created_at: Date;
}

export type Hit = {
	intention: string;
	label: string;
	count: number;
};

export type CategoryData = {
	category: string;
	label: string;
	number_hits: Hit[];
};

export type OpenProduct = {
	product_id: string;
	product_name: string;
	data: CategoryData[];
};

export interface ProductMapEntry {
	productIndex: number;
	categories: {
		[category: string]: number;
	};
}

export type ReviewFiltersType = {
	satisfaction: string;
	easy: string;
	comprehension: string;
	needVerbatim: boolean;
	needOtherDifficulties: boolean;
	needOtherHelp: boolean;
	difficulties: string;
	help: string;
}

export type Condition = {
	answers: {
	  some: {
		field_code: string;
		intention?: AnswerIntention;
		answer_text?: string;
	  };
	};
};
