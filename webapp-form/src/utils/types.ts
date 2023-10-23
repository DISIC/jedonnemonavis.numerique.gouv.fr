export type Feeling = "good" | "bad" | "medium";

export type Opinion = {
  satisfaction?: Feeling;
  easy?: Feeling;
  comprehension?: Feeling;
  contact?: string;
  contact_reached?: string;
  contact_satisfaction?: Feeling;
  contact_channels: string[];
  contact_channels_verbatim?: string;
  difficulties?: string;
  difficulties_details: string[];
  difficulties_details_verbatim?: string;
  help?: string;
  help_details: string[];
  help_details_verbatim?: string;
  verbatim?: string;
};

export type Product = {
  id: number;
  title: string;
};

export type CheckboxOption = {
  label: string;
  value: string;
  name?: string;
  hint?: string;
  isolated?: boolean;
  explanation?: boolean;
};

export type RadioOption = {
  label: string;
  value: string;
  name?: string;
  hint?: string;
  explanation?: boolean;
};

export type Condition = {
  name: keyof Opinion;
  values: string[];
};

export type FormField =
  | {
      kind: "smiley";
      name: keyof Opinion;
      label: string;
      hint?: string;
      conditions?: Condition[];
    }
  | {
      kind: "input-text";
      name: keyof Opinion;
      label: string;
      hint?: string;
      conditions?: Condition[];
    }
  | {
      kind: "input-textarea";
      name: keyof Opinion;
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
