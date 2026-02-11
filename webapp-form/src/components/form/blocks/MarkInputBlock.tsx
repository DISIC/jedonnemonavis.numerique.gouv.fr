import { FormWithElements } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
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

export const MarkInputBlock = ({
  block,
  displayLabel,
  fieldKey,
  answers,
  setAnswers,
  form,
}: Props) => {
  const { classes, cx } = useStyles();
  const markAnswer = answers[fieldKey] as DynamicAnswerData | undefined;
  const markValue = markAnswer?.answer_item_id;

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
        htmlFor={`mark-${block.id}`}
        className={fr.cx("fr-label", "fr-text--md")}
      >
        {displayLabel}
      </label>
      {block.content && <p className={classes.hint}>{block.content}</p>}
      <div className={cx(classes.rating)}>
        <span>{block.downLabel || "Minimum"}</span>
        <fieldset className={fr.cx("fr-fieldset")}>
          <ul>
            {["1", "2", "3", "4", "5"].map((rating) => {
              const ratingOption = visibleOptions.find(
                (opt) => opt.value === rating,
              );
              if (!ratingOption) return null;

              return (
                <li key={rating}>
                  <input
                    id={`mark-${block.id}-${rating}`}
                    className={fr.cx("fr-sr-only")}
                    type="radio"
                    name={fieldKey}
                    value={ratingOption.id.toString()}
                    checked={markValue === ratingOption.id}
                    required={block.isRequired}
                    onChange={() => {
                      setAnswers((prev) => ({
                        ...prev,
                        [fieldKey]: {
                          block_id: block.id,
                          answer_item_id: ratingOption.id,
                        },
                      }));
                    }}
                  />
                  <label
                    htmlFor={`mark-${block.id}-${rating}`}
                    className={
                      markValue === ratingOption.id
                        ? classes.selectedOption
                        : undefined
                    }
                  >
                    {rating}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <span>{block.upLabel || "Maximum"}</span>
      </div>
    </div>
  );
};

const useStyles = tss.withName(MarkInputBlock.name).create(() => ({
  hint: {
    fontSize: "0.9rem",
    color: fr.colors.decisions.text.mention.grey.default,
    marginBottom: fr.spacing("6v"),
    marginTop: `-${fr.spacing("2v")}`,
  },
  rating: {
    display: "flex",
    alignItems: "center",
    [fr.breakpoints.down("md")]: {
      flexDirection: "column",
    },
    "& > span": {
      ...fr.typography[18].style,
      marginBottom: 0,
    },
    fieldset: {
      margin: 0,
      [fr.breakpoints.down("md")]: {
        width: "100%",
      },
      ul: {
        listStyleType: "none",
        columns: 5,
        gap: 10,
        margin: "0 1rem",
        padding: 0,
        overflow: "hidden",
        [fr.breakpoints.down("md")]: {
          columns: "auto",
          width: "100%",
          margin: 0,
        },
        li: {
          label: {
            width: "3.5rem",
            justifyContent: "center",
            border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
            padding: `${fr.spacing("1v")} ${fr.spacing("3v")}`,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            ["&:hover"]: {
              borderColor: fr.colors.decisions.background.alt.grey.active,
              fontWeight: "bold",
            },
            [fr.breakpoints.down("md")]: {
              width: "100%",
            },
          },
        },
      },
    },
  },
  selectedOption: {
    backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
    color: "white",
    fontWeight: "bold",
    borderColor: fr.colors.decisions.background.flat.blueFrance.default,
  },
}));
