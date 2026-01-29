import { FormWithElements } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { SetStateAction } from "react";
import { tss } from "tss-react/dsfr";
import { FormBlockRenderer } from "./FormBlockRenderer";

type Step = FormWithElements["form_template"]["form_template_steps"][0];

type DynamicAnswerData = {
  block_id: number;
  answer_item_id?: number;
  answer_text?: string;
};

type FormAnswers = Record<string, DynamicAnswerData | DynamicAnswerData[]>;

interface Props {
  step: Step;
  form: FormWithElements;
  answers: FormAnswers;
  setAnswers: (value: SetStateAction<FormAnswers>) => void;
}

export const FormStepRenderer = (props: Props) => {
  const { step, form, answers, setAnswers } = props;
  const { classes, cx } = useStyles();

  const formConfig = form.form_configs[0];

  const isStepHidden = formConfig?.form_config_displays?.some(
    (d) => d.kind === "step" && d.parent_id === step.id && d.hidden,
  );

  if (isStepHidden) {
    return null;
  }

  return (
    <div className={cx(classes.container)}>
      <h2 className={cx(classes.title)}>{step.title}</h2>

      {step.form_template_blocks.map((block) => {
        const isBlockHidden = formConfig?.form_config_displays?.some(
          (d) => d.kind === "block" && d.parent_id === block.id && d.hidden,
        );

        if (isBlockHidden) {
          return null;
        }

        return (
          <FormBlockRenderer
            key={block.id}
            block={block}
            form={form}
            answers={answers}
            setAnswers={setAnswers}
          />
        );
      })}
    </div>
  );
};

const useStyles = tss.withName(FormStepRenderer.name).create(() => ({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: fr.spacing("6v"),
  },
  title: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
    marginBottom: fr.spacing("4v"),
  },
}));
