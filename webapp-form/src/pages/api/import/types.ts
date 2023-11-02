import { AnswerIntention, AnswerKind } from '@prisma/client';

export type ImportAnswer = {
  field_label: string;
  field_code: string;
  answer_item_id: number;
  answer_text: string;
  intention: AnswerIntention;
  kind: AnswerKind;
};

export type ImportReview = {
  form_id: number;
  xwiki_id: number;
  product_id: number;
  button_id: number;
  title: string;
  answers: ImportAnswer[];
  created_at: Date;
};
