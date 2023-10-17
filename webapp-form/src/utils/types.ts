export type Feeling = 'good' | 'bad' | 'medium';

export type Opinion = {
  satisfaction?: Feeling;
  easy?: Feeling;
  comprehension?: Feeling;
  contact: string[];
  contact_satisfaction?: Feeling;
  contact_channels: string[];
  difficulties: string[];
  difficulties_verbatim?: string;
  help: string[];
  help_verbatim?: string;
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
      kind: 'smiley';
      name: keyof Opinion;
      label: string;
      hint?: string;
      condition?: Condition;
    }
  | {
      kind: 'input-text';
      name: keyof Opinion;
      label: string;
      hint?: string;
      condition?: Condition;
    }
  | {
      kind: 'input-textarea';
      name: keyof Opinion;
      label: string;
      hint?: string;
      condition?: Condition;
    }
  | {
      kind: 'checkbox';
      name: keyof Opinion;
      label: string;
      condition?: Condition;
      options: CheckboxOption[];
    }
  | {
      kind: 'radio';
      name: keyof Opinion;
      label: string;
      condition?: Condition;
      options: RadioOption[];
    };