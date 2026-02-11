import { FormWithElements } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
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
  form: FormWithElements;
}

export const CheckboxBlock = ({
  block,
  displayLabel,
  fieldKey,
  answers,
  setAnswers,
  form,
}: Props) => {
  const { classes } = useStyles();
  const checkboxAnswers = answers[fieldKey] as DynamicAnswerData[] | undefined;
  const checkboxValues = checkboxAnswers?.map((a) => a.answer_item_id) || [];

  const formConfig = form.form_configs[0];
  const visibleOptions = block.options.filter((opt) => {
    const isHidden = formConfig?.form_config_displays?.some(
      (d) => d.kind === "blockOption" && d.parent_id === opt.id && d.hidden,
    );
    return !isHidden;
  });

  return (
    <div>
      <label
        htmlFor={`checkbox-${block.id}`}
        className={fr.cx("fr-label", "fr-text--md")}
      >
        {displayLabel}
      </label>
      {block.content && <p className={classes.hint}>{block.content}</p>}
      <Checkbox
        options={visibleOptions.map((opt, index) => ({
          label: opt.label || "",
          hintText: opt.hint,
          nativeInputProps: {
            id: index === 0 ? `checkbox-${block.id}` : undefined,
            value: opt.id.toString(),
            checked: checkboxValues.includes(opt.id),
            required:
              block.isRequired && checkboxValues.length === 0 && index === 0,
            onChange: (e) => {
              const currentAnswers =
                (answers[fieldKey] as DynamicAnswerData[]) || [];
              if (e.target.checked) {
                setAnswers((prev) => ({
                  ...prev,
                  [fieldKey]: [
                    ...currentAnswers,
                    {
                      block_id: block.id,
                      answer_item_id: opt.id,
                    },
                  ],
                }));
              } else {
                setAnswers((prev) => ({
                  ...prev,
                  [fieldKey]: currentAnswers.filter(
                    (a) => a.answer_item_id !== opt.id,
                  ),
                }));
              }
            },
          },
        }))}
      />
    </div>
  );
};

const useStyles = tss.withName(CheckboxBlock.name).create(() => ({
  hint: {
    fontSize: "0.9rem",
    color: fr.colors.decisions.text.mention.grey.default,
    marginBottom: fr.spacing("2v"),
  },
}));
