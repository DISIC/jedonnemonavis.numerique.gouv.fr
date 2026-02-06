import { FormWithElements } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { SetStateAction } from "react";
import { tss } from "tss-react/dsfr";
import { SmileyBlock } from "../blocks/SmileyBlock";
import { TextAreaBlock } from "../blocks/TextAreaBlock";
import { TextInputBlock } from "../blocks/TextInputBlock";
import { MarkInputBlock } from "../blocks/MarkInputBlock";
import { RadioBlock } from "../blocks/RadioBlock";
import { CheckboxBlock } from "../blocks/CheckboxBlock";
import { ParagraphBlock } from "../blocks/ParagraphBlock";
import { HeadingBlock } from "../blocks/HeadingBlock";
import { DividerBlock } from "../blocks/DividerBlock";
import { SelectBlock } from "../blocks/SelectBlock";

type Block =
  FormWithElements["form_template"]["form_template_steps"][0]["form_template_blocks"][0];

type DynamicAnswerData = {
  block_id: number;
  answer_item_id?: number;
  answer_text?: string;
};

type FormAnswers = Record<string, DynamicAnswerData | DynamicAnswerData[]>;

interface Props {
  block: Block;
  form: FormWithElements;
  answers: FormAnswers;
  setAnswers: (value: SetStateAction<FormAnswers>) => void;
}

export const FormBlockRenderer = (props: Props) => {
  const { block, form, answers, setAnswers } = props;
  const { classes, cx } = useStyles();

  const formConfig = form.form_configs[0];
  const labelConfig = formConfig?.form_config_labels?.find(
    (l) => l.kind === "block" && l.parent_id === block.id,
  );

  const displayLabel = labelConfig?.label || block.label || "";
  const fieldKey = `block_${block.id}`;

  const renderBlockContent = () => {
    const commonProps = {
      block,
      displayLabel,
      fieldKey,
      answers,
      setAnswers,
      form,
    };

    switch (block.type_bloc) {
      case "smiley_input":
        return <SmileyBlock {...commonProps} />;

      case "input_text_area":
        return <TextAreaBlock {...commonProps} />;

      case "input_text":
        return <TextInputBlock {...commonProps} />;

      case "mark_input":
        return <MarkInputBlock {...commonProps} />;

      case "radio":
        return <RadioBlock {...commonProps} />;

      case "checkbox":
        return <CheckboxBlock {...commonProps} />;

      case "paragraph":
        return <ParagraphBlock block={block} displayLabel={displayLabel} />;

      case "heading_1":
        return <HeadingBlock level={1} displayLabel={displayLabel} />;

      case "heading_2":
        return <HeadingBlock level={2} displayLabel={displayLabel} />;

      case "heading_3":
        return <HeadingBlock level={3} displayLabel={displayLabel} />;

      case "divider":
        return <DividerBlock />;

      case "select":
        return <SelectBlock />;

      default:
        return null;
    }
  };

  return (
    <div className={cx(classes.blockContainer)}>{renderBlockContent()}</div>
  );
};

const useStyles = tss.withName(FormBlockRenderer.name).create(() => ({
  blockContainer: {
    marginBottom: fr.spacing("6v"),
  },
}));
