import { Answer, Prisma } from "@prisma/client";

export type Feeling = "good" | "bad" | "medium";

export type Opinion = {
  satisfaction?: number;
  easy?: number;
  comprehension?: number;
  contact?: number;
  contact_reached?: number;
  contact_satisfaction?: number;
  contact_channels: number[];
  contact_channels_verbatim?: string;
  difficulties?: number;
  difficulties_details: number[];
  difficulties_details_verbatim?: string;
  help?: number;
  help_details: number[];
  help_details_verbatim?: string;
  verbatim?: string;
};

export type Product = {
  id: number;
  title: string;
  buttons: {id: number}[]
};

type BaseOption = {
  label: string;
  value: number;
  intention: "good" | "medium" | "bad" | "neutral";
  name?: string;
  hint?: string;
  isolated?: boolean;
};

export type CheckboxOption = {
  explanation?: boolean;
} & BaseOption;

export type RadioOption = BaseOption;

export type Condition = {
  name: keyof Opinion;
  values: number[];
};

export type FormField =
  | {
      kind: "smiley";
      name: keyof Opinion;
      label: string;
      hint?: string;
      values: { [key in Feeling]: number };
      conditions?: Condition[];
    }
  | {
      kind: "input-text";
      name: keyof Pick<
        Opinion,
        | "verbatim"
        | "help_details_verbatim"
        | "difficulties_details_verbatim"
        | "contact_channels_verbatim"
      >;
      label: string;
      hint?: string;
      conditions?: Condition[];
    }
  | {
      kind: "input-textarea";
      name: keyof Pick<
        Opinion,
        | "verbatim"
        | "help_details_verbatim"
        | "difficulties_details_verbatim"
        | "contact_channels_verbatim"
      >;
      label: string;
      hint?: string;
      conditions?: Condition[];
    }
  | {
      kind: "checkbox";
      name: keyof Opinion;
      label: string;
      conditions?: Condition[];
      options: CheckboxOption[];
    }
  | {
      kind: "radio";
      name: keyof Opinion;
      label: string;
      conditions?: Condition[];
      options: RadioOption[];
    };

export interface ElkAnswer extends Prisma.AnswerUncheckedCreateInput {
  product_name: string;
  product_id: number;
  button_name: string;
  button_id: number;
  created_at: Date;
}

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
