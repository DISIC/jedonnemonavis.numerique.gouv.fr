import { FormWithElements } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { SetStateAction } from "react";
import { tss } from "tss-react/dsfr";
import { FormBlockRenderer } from "./FormBlockRenderer";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

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
  currentStepIndex: number;
  totalSteps: number;
}

export const FormStepRenderer = (props: Props) => {
  const { step, form, answers, setAnswers, currentStepIndex, totalSteps } =
    props;
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
      {form.form_template.hasStepper && totalSteps > 1 && (
        <>
          <h1 className={cx(classes.title, fr.cx("fr-mb-12v"))}>
            {step.title}
          </h1>
          <Stepper
            currentStep={currentStepIndex + 1}
            stepCount={totalSteps}
            title={step.title}
            className={fr.cx("fr-mb-12v")}
          />
        </>
      )}

      {(!form.form_template.hasStepper || totalSteps === 1) && (
        <h1 className={cx(classes.subtitle)}>{step.title}</h1>
      )}

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
    textAlign: "center",
    color: fr.colors.decisions.background.flat.blueFrance.default,
    marginBottom: 0,
    [fr.breakpoints.down("md")]: {
      display: "none",
    },
  },
  subtitle: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
    marginBottom: fr.spacing("10v"),
    textAlign: "center",
  },
}));
