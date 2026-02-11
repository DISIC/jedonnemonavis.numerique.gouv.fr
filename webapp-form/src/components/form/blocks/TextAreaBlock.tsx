import { FormWithElements } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { SetStateAction } from "react";
import { tss } from "tss-react/dsfr";

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
  displayLabel: string;
  fieldKey: string;
  answers: FormAnswers;
  setAnswers: (value: SetStateAction<FormAnswers>) => void;
}

export const TextAreaBlock = ({
  block,
  displayLabel,
  fieldKey,
  answers,
  setAnswers,
}: Props) => {
  const { classes, cx } = useStyles();
  const textareaAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
  const textareaValue = textareaAnswer?.answer_text || "";

  return (
    <div className={classes.inputContainer}>
      <label
        htmlFor={`textarea-${block.id}`}
        className={fr.cx("fr-label", "fr-text--md")}
      >
        {displayLabel}
      </label>
      {block.content && <p className={classes.hint}>{block.content}</p>}
      <Input
        label=""
        nativeTextAreaProps={{
          id: `textarea-${block.id}`,
          value: textareaValue,
          maxLength: 15000,
          required: block.isRequired,
          onChange: (e) => {
            const value = e.target.value;
            setAnswers((prev) => ({
              ...prev,
              [fieldKey]: {
                block_id: block.id,
                answer_text: value,
              },
            }));
          },
        }}
        state={textareaValue.length > 15000 ? "error" : "default"}
        stateRelatedMessage="Maximum 15000 caractères"
        textArea
      />
      <div className={cx(classes.textCount, fr.cx("fr-hint-text"))}>
        {textareaValue.length} / 15000
      </div>
    </div>
  );
};

const useStyles = tss.withName(TextAreaBlock.name).create(() => ({
  inputContainer: {
    display: "flex",
    flexDirection: "column",
  },
  textCount: {
    alignSelf: "flex-end",
  },
  hint: {
    fontSize: "0.9rem",
    color: fr.colors.decisions.text.mention.grey.default,
    marginBottom: fr.spacing("6v"),
    marginTop: `-${fr.spacing("2v")}`,
  },
}));
