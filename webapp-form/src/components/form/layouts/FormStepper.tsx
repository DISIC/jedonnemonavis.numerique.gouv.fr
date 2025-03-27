import { secondSectionA, steps_A, steps_B } from "@/src/utils/form";
import { FormField, Opinion, Product, Step } from "@/src/utils/types";
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
  product: Product;
  opinion: Opinion;
  steps: Step[];
  onSubmit: (opinion: Opinion, isLastStep: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

export const FormStepper = (props: Props) => {
  const { onSubmit, opinion, steps, currentStep, product, setCurrentStep } =
    props;

  const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);
  const { t } = useTranslation();

  const router = useRouter();

  const { classes, cx } = useStyles();

  const formTemplateStep = product.form.form_template.form_template_steps.find(
    (fts) => fts.title === t(`${steps[currentStep].name}`, { lng: "fr" })
  );

  return (
    <div>
      <div>
        {steps.length > 1 && (
          <>
            <h1 className={cx(classes.title, fr.cx("fr-mb-14v"))}>
              {t(`${steps[currentStep].name}`)}
            </h1>
            <Stepper
              currentStep={currentStep + 1}
              stepCount={steps.length}
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
            window.scrollTo({ top: 0, behavior: "smooth" });
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
              formConfig={product.form.form_configs[0]}
              formTemplateStep={formTemplateStep}
            />
          </div>
        ))}

        <div className={cx(fr.cx("fr-mt-8v"), classes.buttonContainer)}>
          <Button
            priority="secondary"
            iconId="fr-icon-arrow-left-line"
            iconPosition="left"
            type="button"
            onClick={() => {
              router.back();
            }}
          >
            {t(`${steps[currentStep].buttonBack}`)}{" "}
          </Button>

          <Button
            type="submit"
            disabled={
              !tmpOpinion.satisfaction ||
              (router.query.iframe === "true" &&
                t(steps[currentStep].name) === "Informations complémentaires")
            }
          >
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
    field: {
      marginBottom: fr.spacing("14v"),
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
    },
  }));
