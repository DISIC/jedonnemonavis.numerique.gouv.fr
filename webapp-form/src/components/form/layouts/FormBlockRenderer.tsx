import { FormWithElements } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { SetStateAction } from "react";
import { tss } from "tss-react/dsfr";
import { SmileyInput } from "../elements/SmileyInput";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

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
    switch (block.type_bloc) {
      case "smiley_input":
        const smileyAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
        const smileyValue = smileyAnswer?.answer_item_id;
        return (
          <SmileyInput
            label={displayLabel}
            name={fieldKey}
            hint={block.content || undefined}
            value={smileyValue}
            onChange={(feeling) => {
              const smileyItemId =
                feeling === "bad" ? 1 : feeling === "medium" ? 2 : 3;
              setAnswers((prev) => ({
                ...prev,
                [fieldKey]: {
                  block_id: block.id,
                  answer_item_id: smileyItemId,
                },
              }));
            }}
          />
        );

      case "input_text_area":
        const textareaAnswer = answers[fieldKey] as
          | DynamicAnswerData
          | undefined;
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

      case "input_text":
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

      case "radio":
      case "mark_input":
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

      case "checkbox":
        const checkboxAnswers = answers[fieldKey] as
          | DynamicAnswerData[]
          | undefined;
        const checkboxValues =
          checkboxAnswers?.map((a) => a.answer_item_id) || [];
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
              options={block.options.map((opt, index) => ({
                label: opt.label || "",
                nativeInputProps: {
                  id: index === 0 ? `checkbox-${block.id}` : undefined,
                  value: opt.id.toString(),
                  checked: checkboxValues.includes(opt.id),
                  required:
                    block.isRequired &&
                    checkboxValues.length === 0 &&
                    index === 0,
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

      case "paragraph":
        return block.content ? (
          <div dangerouslySetInnerHTML={{ __html: block.content }} />
        ) : null;

      case "heading_1":
        return <h1>{displayLabel}</h1>;

      case "heading_2":
        return <h2>{displayLabel}</h2>;

      case "heading_3":
        return <h3>{displayLabel}</h3>;

      case "divider":
        return <hr className={fr.cx("fr-my-4v")} />;

      case "select":
        return <div>Select input not yet implemented</div>;

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
  inputContainer: {
    display: "flex",
    flexDirection: "column",
  },
  textCount: {
    alignSelf: "flex-end",
  },
  infoText: {
    color: fr.colors.decisions.text.default.info.default,
    fontSize: "0.8rem",
    ".fr-icon-info-fill::before": {
      "--icon-size": "1rem",
    },
  },
  hint: {
    fontSize: "0.9rem",
    color: fr.colors.decisions.text.mention.grey.default,
    marginBottom: fr.spacing("2v"),
  },
}));
