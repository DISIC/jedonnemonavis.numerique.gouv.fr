import { Answer, Prisma } from "@prisma/client";

export type Feeling = "good" | "bad" | "medium";

export type Opinion = {
  satisfaction?: number;
  easy?: number;
  contact_tried: number[];
  contact_reached: string[];
  contact_satisfaction: string[];
  contact_tried_verbatim?: string;
  verbatim?: string;
};

export type Product = {
  id: number;
  title: string;
  buttons: { id: number }[];
};

type BaseOption = {
  label: string;
  value: number;
  intention: "very_good" | "good" | "medium" | "bad" | "very_bad" | "neutral";
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
      name: keyof Pick<Opinion, "verbatim" | "contact_tried_verbatim">;
      label: string;
      hint?: string;
      conditions?: Condition[];
    }
  | {
      kind: "input-textarea";
      name: keyof Pick<Opinion, "verbatim" | "contact_tried_verbatim">;
      label: string;
      hint?: string;
      conditions?: Condition[];
    }
  | {
      kind: "checkbox";
      name: keyof Opinion;
      label: string;
      hint: string;
      conditions?: Condition[];
      options: CheckboxOption[];
    }
  | {
      kind: "array-radio";
      name: keyof Opinion;
      label: string;
      conditions?: Condition[];
      options: RadioOption[];
      needed: number[];
      excluded: number[];
    }
  | {
      kind: "yes-no";
      name: keyof Opinion;
      label: string;
      conditions?: Condition[];
      options: RadioOption[];
      needed: number[];
      excluded: number[];
    }
  | {
      kind: "radio";
      name: keyof Opinion;
      label: string;
      hint?: string;
      hintLeft?: string;
      hintRight?: string;
      conditions?: Condition[];
      options: RadioOption[];
    };

export type Step = {
  name: string;
  section: FormField[];
  button: string;
};

export interface ElkAnswer extends Prisma.AnswerUncheckedCreateInput {
  product_name: string;
  product_id: number;
  button_name: string;
  button_id: number;
  parent_field_code?: string;
  parent_answer_item_id?: number;
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
