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

export const TextInputBlock = ({
  block,
  displayLabel,
  fieldKey,
  answers,
  setAnswers,
}: Props) => {
  const { classes } = useStyles();
  const inputAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
  const inputValue = inputAnswer?.answer_text || "";

  return (
    <div>
      <label
        htmlFor={`input-${block.id}`}
        className={fr.cx("fr-label", "fr-text--md")}
      >
        {displayLabel}
      </label>
      {block.content && <p className={classes.hint}>{block.content}</p>}
      <Input
        label=""
        nativeInputProps={{
          id: `input-${block.id}`,
          value: inputValue,
          maxLength: 250,
          required: block.isRequired,
          onChange: (e) => {
            setAnswers((prev) => ({
              ...prev,
              [fieldKey]: {
                block_id: block.id,
                answer_text: e.target.value,
              },
            }));
          },
        }}
        state={inputValue.length > 250 ? "error" : "default"}
        stateRelatedMessage="Maximum 250 caractères"
      />
    </div>
  );
};

const useStyles = tss.withName(TextInputBlock.name).create(() => ({
  hint: {
    fontSize: "0.9rem",
    color: fr.colors.decisions.text.mention.grey.default,
    marginBottom: fr.spacing("2v"),
  },
}));
