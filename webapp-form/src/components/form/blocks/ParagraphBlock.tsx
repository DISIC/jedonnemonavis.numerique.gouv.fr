import { FormWithElements } from "@/src/utils/types";

type Block =
  FormWithElements["form_template"]["form_template_steps"][0]["form_template_blocks"][0];

interface Props {
  block: Block;
  displayLabel?: string;
}

export const ParagraphBlock = ({ block, displayLabel }: Props) => {
  const content = displayLabel || block.content;
  return content ? <div dangerouslySetInnerHTML={{ __html: content }} /> : null;
};
