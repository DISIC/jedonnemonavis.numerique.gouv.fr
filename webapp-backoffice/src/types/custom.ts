import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { AnswerIntention, Prisma } from '@prisma/client';
import { z } from 'zod';
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

export type Buckets = Array<{
	key: string;
	key_as_string: string;
	doc_count: number;
	date: string;
}>;

export type BucketsInside = Array<{
	key: string;
	key_as_string: string;
	doc_count: number;
	term: {
		buckets: Buckets;
	};
}>;

export interface ElkAnswer extends Prisma.AnswerUncheckedCreateInput {
	product_name: string;
	product_id: number;
	button_name: string;
	button_id: number;
	created_at: Date;
}

export interface ElkAnswerDefaults {
	field_label: string;
	field_code: string;
	intention: AnswerIntention;
	answer_text: string;
}

export type Hit = {
	intention: string;
	label: string;
	count: number;
	children?: CategoryData[];
};

export type CategoryData = {
	category: string;
	label: string;
	number_hits: Hit[];
};

export type OpenProduct = {
	product_id: string;
	product_name: string;
	forms: {
		form_id: string;
		form_name: string;
		intervals: Array<{
			date: string;
			length_interval: string;
			data: CategoryData[];
		}>;
	}[];
};

export interface ProductMapEntry {
	productIndex: number;
	forms: {
		[formIndex: string]: {
			formIndex: number;
			dateMap: {
				[date: string]: {
					dateIndex: number;
					categories: {
						[category: string]: number;
					};
				};
			};
		};
	};
}

export interface FormHelper {
	id: number;
	product_id: number;
	legacy: boolean;
	title: string | null;
	form_template: { title: string };
	product: { title: string };
}

export interface BucketData {
	productId: string;
	formId: string;
	fieldCode: string;
	parentFieldCode: string;
	parentAnswerItemId: string;
	fieldLabel: string;
	intention: string;
	answerText: string;
	answerItemId: string;
	docCount: number;
	docDate: string;
}

export interface ProductBuilder {
	products: OpenProduct[];
	productIndexMap: Map<string, number>;
	formIndexMap: Map<string, Map<string, number>>;
	intervalIndexMap: Map<string, Map<string, Map<string, number>>>;
	categoryIndexMap: Map<string, Map<string, Map<string, Map<string, number>>>>;
}

export type ReviewFiltersType = {
	needVerbatim: boolean;
	needOtherDifficulties: boolean;
	needOtherHelp: boolean;
	buttonId: string[];
	fields: Array<{
		field_code: string;
		values: string[];
	}>;
};

const ZBaseHitSchema = z.object({
	intention: z.string(),
	label: z.string(),
	count: z.number()
});

const ZOpenApiStatsCategory: z.ZodType = z.object({
	category: z.string(),
	label: z.string(),
	number_hits: z.array(
		ZBaseHitSchema.extend({
			children: z.lazy(() => ZOpenApiStatsCategory.array().optional())
		})
	)
});

export const ZOpenApiStatsOutput = z.object({
	data: z.array(
		z.object({
			product_id: z.string(),
			product_name: z.string(),
			forms: z.array(
				z.object({
					form_id: z.string(),
					form_name: z.string(),
					intervals: z.array(
						z.object({
							date: z.string(),
							length_interval: z.string(),
							data: z.array(ZOpenApiStatsCategory)
						})
					)
				})
			)
		})
	)
});

export interface CustomModalProps {
	buttonProps: {
		id: string;
		'aria-controls': string;
		'data-fr-opened': boolean;
	};
	Component: (props: ModalProps) => JSX.Element;
	close: () => void;
	open: () => void;
	isOpenedByDefault: boolean;
	id: string;
}
