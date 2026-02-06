import { FormWithElements } from "./types";

type Block =
  FormWithElements["form_template"]["form_template_steps"][0]["form_template_blocks"][0];

export const getFieldCode = (block: Block): string => {
  const fieldCode = (block as any).field_code;
  if (fieldCode) {
    return fieldCode;
  }
  return `block_${block.id}`;
};
