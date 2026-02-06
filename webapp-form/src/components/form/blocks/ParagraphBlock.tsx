import { FormWithElements } from "@/src/utils/types";

type Block =
  FormWithElements["form_template"]["form_template_steps"][0]["form_template_blocks"][0];

interface Props {
  block: Block;
}

export const ParagraphBlock = ({ block }: Props) => {
  return block.content ? (
    <div dangerouslySetInnerHTML={{ __html: block.content }} />
  ) : null;
};
