import { FormWithElements } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
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

export const RadioBlock = ({
  block,
  displayLabel,
  fieldKey,
  answers,
  setAnswers,
}: Props) => {
  const { classes } = useStyles();
  const radioAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
  const radioValue = radioAnswer?.answer_item_id;

  return (
    <div>
      <label
        htmlFor={`radio-${block.id}`}
        className={fr.cx("fr-label", "fr-text--md")}
      >
        {displayLabel}
      </label>
      {block.content && <p className={classes.hint}>{block.content}</p>}
      <RadioButtons
        id={`radio-${block.id}`}
        options={block.options.map((opt) => ({
          label: opt.label || "",
          nativeInputProps: {
            value: opt.id.toString(),
            checked: radioValue === opt.id,
            required: block.isRequired,
            onChange: () => {
              setAnswers((prev) => ({
                ...prev,
                [fieldKey]: {
                  block_id: block.id,
                  answer_item_id: opt.id,
                },
              }));
            },
          },
        }))}
      />
    </div>
  );
};

const useStyles = tss.withName(RadioBlock.name).create(() => ({
  hint: {
    fontSize: "0.9rem",
    color: fr.colors.decisions.text.mention.grey.default,
    marginBottom: fr.spacing("2v"),
  },
}));
