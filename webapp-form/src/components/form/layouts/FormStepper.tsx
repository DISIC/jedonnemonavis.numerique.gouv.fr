import { secondSectionA, steps_A, steps_B } from "@/src/utils/form";
import { FormField, Opinion, Step } from "@/src/utils/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useEffect, useState } from "react";
import { tss } from "tss-react/dsfr";
import { Field } from "../elements/Field";
import { SmileyInput } from "../elements/SmileyInput";
import { useTranslation } from "next-i18next";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { useRouter } from "next/router";

type Props = {
  opinion: Opinion;
  steps: Step[];
  onSubmit: (opinion: Opinion, isLastStep: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

export const FormStepper = (props: Props) => {
  const { onSubmit, opinion, steps, currentStep, setCurrentStep } = props;

  const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);
  const { t } = useTranslation();

  const router = useRouter();

  const { classes, cx } = useStyles();

  return (
    <div>
      <div className={cx(classes.step)}>
        {steps.length > 1 && (
          <>
            <h1 className={cx(classes.title, fr.cx("fr-mb-14v"))}>
              {t(`${steps[currentStep].name}`)}
            </h1>
            <Stepper
              currentStep={currentStep + 1}
              stepCount={
                process.env.NEXT_PUBLIC_AB_TESTING === "A"
                  ? steps_A.length
                  : steps_B.length
              }
              title={t(`${steps[currentStep].name}`)}
            />
          </>
        )}
      </div>
      <form
        onSubmit={(e) => {
          const isLastStep = currentStep + 1 === steps.length;
          if (!isLastStep) {
            setCurrentStep(currentStep + 1);
          }
          e.preventDefault();
          onSubmit(tmpOpinion, isLastStep);
        }}
      >
        {steps[currentStep].section.map((field: FormField) => (
          <div key={field.name} className={cx(classes.field)}>
            <Field
              field={field}
              opinion={tmpOpinion}
              setOpinion={setTmpOpinion}
              form={secondSectionA}
            />
          </div>
        ))}

        <div className={fr.cx("fr-mt-8v")}>
          <Button type="submit" disabled={!tmpOpinion.satisfaction}>
            {t(`${steps[currentStep].button}`)}
          </Button>
        </div>
      </form>
    </div>
  );
};

const useStyles = tss
  .withName(SmileyInput.name)
  .withParams()
  .create(() => ({
    title: {
      [fr.breakpoints.down("md")]: {
        display: "none",
      },
    },
    step: {
      ".fr-stepper__title": {
        display: "none",
      },
    },
    field: {
      marginBottom: fr.spacing("14v"),
    },
  }));
