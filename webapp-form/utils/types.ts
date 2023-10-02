import { ReactNode } from "react";

export type Feeling = "good" | "bad" | "medium";

export type Opinion = {
  satisfaction?: Feeling;
  easy?: Feeling;
  comprehension?: Feeling;
  difficulties: string[];
  difficulties_verbatim?: string;
  help: string[];
  help_verbatim?: string;
  verbatim?: string;
};

export type Product = {
  id: string;
  title: string;
};

export type FormField =
  | {
      kind: "smiley";
      name: keyof Opinion;
      label: string;
      hint?: string;
      condition?: {
        name: keyof Opinion;
        value: string;
      };
    }
  | {
      kind: "input-text";
      name: keyof Opinion;
      label: string;
      hint?: string;
      condition?: {
        name: keyof Opinion;
        value: string;
      };
    }
  | {
      kind: "input-textarea";
      name: keyof Opinion;
      label: string;
      hint?: string;
      condition?: {
        name: keyof Opinion;
        value: string;
      };
    }
  | {
      kind: "checkbox";
      name: keyof Opinion;
      label: string;
      condition?: {
        name: keyof Opinion;
        value: string;
      };
      options: {
        label: string;
        value: string;
        name?: string;
        hint?: string;
        explanation?: boolean;
      }[];
    };
